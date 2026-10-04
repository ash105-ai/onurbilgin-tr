"""
matrix_bridge.py
================
AR Calculator ↔ Arduino MAX7219 dot matrix köprüsü.

Kullanım (main.py içinden):
    from matrix_bridge import MatrixBridge
    matrix = MatrixBridge()          # otomatik port bul
    matrix.send_message("3 + 5 = 8")
    matrix.security_mode()
    matrix.welcome_admin("ONUR BILGIN")
    matrix.clear()
    matrix.close()
"""

import serial
import serial.tools.list_ports
import threading
import time
import logging

logger = logging.getLogger(__name__)


# ── Ayarlar ────────────────────────────────────────────────────────────────
BAUD_RATE     = 9600
CONNECT_TIMEOUT = 3      # saniye — Arduino'nun boot süresi
READ_TIMEOUT    = 2      # saniye — ACK bekleme süresi
AUTO_DETECT_KW  = ["Arduino", "CH340", "CP210", "USB Serial", "ttyUSB", "ttyACM"]
MAX_MSG_LEN     = 120    # Arduino tamponu 128 byte

# Varsayılan port (otomatik bulunamazsa devreye girer)
DEFAULT_PORT_WIN   = "COM3"
DEFAULT_PORT_LINUX = "/dev/ttyUSB0"
DEFAULT_PORT_MAC   = "/dev/cu.usbserial-0001"
# ───────────────────────────────────────────────────────────────────────────


class MatrixBridge:
    """
    Arduino 4x8x8 dot matrix ile seri haberleşme sınıfı.
    Thread-safe: farklı thread'lerden güvenle çağrılabilir.
    Arduino bağlı değilse hiçbir şey yapmaz (sessiz hata).
    """

    def __init__(self, port: str = None, baud: int = BAUD_RATE):
        self._port   = port
        self._baud   = baud
        self._serial = None
        self._lock   = threading.Lock()
        self._connected = False
        self._connect()

    # ── Bağlantı ─────────────────────────────────────────────────────────

    def _connect(self):
        """Seri portu aç; başarısız olursa sessizce devam et."""
        port = self._port or self._auto_detect_port()
        if port is None:
            logger.warning("MatrixBridge: Arduino portu bulunamadı. Matrix devre dışı.")
            return
        try:
            self._serial = serial.Serial(port, self._baud, timeout=READ_TIMEOUT)
            time.sleep(CONNECT_TIMEOUT)   # Arduino reset süresi
            # READY veya MATRIX_READY satırını bekle
            deadline = time.time() + 4
            while time.time() < deadline:
                line = self._serial.readline().decode(errors="ignore").strip()
                if "READY" in line:
                    break
            self._connected = True
            logger.info(f"MatrixBridge: {port} @ {self._baud} baud — BAĞLANDI")
        except Exception as e:
            logger.warning(f"MatrixBridge: Bağlantı hatası ({port}): {e}")
            self._serial = None
            self._connected = False

    @staticmethod
    def _auto_detect_port() -> str | None:
        """Bilinen Arduino/USB-serial anahtar kelimelerine göre port tara."""
        for p in serial.tools.list_ports.comports():
            desc = f"{p.description} {p.manufacturer or ''}"
            if any(kw.lower() in desc.lower() for kw in AUTO_DETECT_KW):
                logger.info(f"MatrixBridge: Otomatik port bulundu → {p.device}")
                return p.device
        # Hiç eşleşme yoksa ilk COM/tty dene
        ports = list(serial.tools.list_ports.comports())
        if ports:
            return ports[0].device
        return None

    @property
    def connected(self) -> bool:
        return self._connected

    # ── Düşük seviye gönderme ─────────────────────────────────────────────

    def _send_raw(self, command: str) -> bool:
        """
        Arduino'ya satır gönder, ACK bekle.
        Başarılıysa True, yoksa False döner.
        """
        if not self._connected or self._serial is None:
            return False
        with self._lock:
            try:
                line = command.strip() + "\n"
                self._serial.write(line.encode())
                self._serial.flush()
                # ACK oku (isteğe bağlı — ACK gelmese de devam et)
                ack = self._serial.readline().decode(errors="ignore").strip()
                return ack.startswith("ACK") or ack == "PONG"
            except Exception as e:
                logger.warning(f"MatrixBridge: Gönderme hatası: {e}")
                self._connected = False
                return False

    # ── Genel API ─────────────────────────────────────────────────────────

    def send_message(self, text: str):
        """Herhangi bir metni kaydırarak göster."""
        text = str(text)[:MAX_MSG_LEN]
        self._send_raw(f"MSG:{text}")

    def clear(self):
        """Ekranı temizle."""
        self._send_raw("CLR")

    def set_brightness(self, level: int):
        """Parlaklık: 0 (en karanlık) … 15 (en parlak)."""
        level = max(0, min(15, int(level)))
        self._send_raw(f"BRI:{level}")

    def ping(self) -> bool:
        """Bağlantıyı test et."""
        return self._send_raw("PING")

    # ── Uygulama-özel mesajlar ─────────────────────────────────────────────

    def calculator_result(self, expression: str, result: str):
        """
        Hesap sonucunu göster.
        Örnek: "3 + 5 = 8"
        """
        msg = f"{expression} = {result}"
        self.send_message(msg)

    def security_mode(self):
        """Security moduna geçince göster."""
        self.send_message("** SECURITY MODE **")

    def welcome_admin(self, real_name: str):
        """
        Admin doğrulandığında göster.
        Örnek çıktı: "WELCOME ADMIN ONUR BILGIN"
        """
        msg = f"WELCOME ADMIN {real_name.upper()}"
        self.send_message(msg)

    def unauthorized(self):
        """Yetkisiz kişi tespitinde göster."""
        self.send_message("!! UNAUTHORIZED PERSON DETECTED !!")

    # ── Temizlik ──────────────────────────────────────────────────────────

    def close(self):
        """Seri portu kapat."""
        if self._serial and self._serial.is_open:
            self.clear()
            time.sleep(0.3)
            self._serial.close()
        self._connected = False
        logger.info("MatrixBridge: Bağlantı kapatıldı.")

    def __del__(self):
        try:
            self.close()
        except Exception:
            pass
