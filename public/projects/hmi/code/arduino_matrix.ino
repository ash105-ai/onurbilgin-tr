/*
 * ============================================================
 *  AR CALCULATOR — 4x MAX7219 8x8 DOT MATRIX SCROLLING TEXT
 * ============================================================
 *  Bağlantı (tüm modüller zincirleme / daisy-chain):
 *
 *   MAX7219 Pin  →  Arduino Pin
 *   VCC          →  5V
 *   GND          →  GND
 *   DIN          →  D11  (MOSI)
 *   CLK          →  D13  (SCK)
 *   CS (LOAD)    →  D10
 *
 *  Kütüphane: MD_Parola + MD_MAX72XX
 *  Arduino IDE → Library Manager → "MD_Parola" kur (MD_MAX72XX otomatik gelir)
 *
 *  Seri protokol (9600 baud, newline ile biter):
 *    MSG:<metin>\n     → kayar yazı başlat
 *    CLR\n             → ekranı temizle
 *    BRI:<0-15>\n      → parlaklık ayarla
 * ============================================================
 */

#include <MD_Parola.h>
#include <MD_MAX72XX.h>
#include <SPI.h>

// --- Donanım Ayarları ---
#define HARDWARE_TYPE  MD_MAX72XX::FC16_HW  // Çoğu hazır modül için FC16
#define MAX_DEVICES    4                    // Kaç adet 8x8 modül var
#define CS_PIN         10                   // Chip Select pini

MD_Parola display = MD_Parola(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);

// --- Kayar yazı ayarları ---
#define SCROLL_SPEED   50     // ms cinsinden gecikme (düşük = hızlı)
#define SCROLL_PAUSE   0      // Döngü arası duraklama (ms)
#define TEXT_EFFECT    PA_SCROLL_LEFT

char currentMsg[128] = "READY";
bool newMsgReady     = false;

// --- Seri okuma tamponu ---
String serialBuffer = "";

// ============================================================
void setup() {
  Serial.begin(9600);
  display.begin();
  display.setIntensity(6);           // 0-15 arası parlaklık
  display.setTextAlignment(PA_LEFT);
  display.displayScroll(currentMsg, PA_LEFT, TEXT_EFFECT, SCROLL_SPEED);
  Serial.println("MATRIX_READY");
}

// ============================================================
void loop() {
  // ---- Seri veri oku ----
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n') {
      processCommand(serialBuffer);
      serialBuffer = "";
    } else if (c != '\r') {
      serialBuffer += c;
    }
  }

  // ---- Yeni mesaj varsa sıfırla ve başlat ----
  if (newMsgReady) {
    display.displayScroll(currentMsg, PA_LEFT, TEXT_EFFECT, SCROLL_SPEED);
    newMsgReady = false;
  }

  // ---- Animasyonu çalıştır ----
  if (display.displayAnimate()) {
    display.displayReset();  // sonsuz döngü
  }
}

// ============================================================
void processCommand(String cmd) {
  cmd.trim();

  // MSG:<metin>
  if (cmd.startsWith("MSG:")) {
    String msg = cmd.substring(4);
    msg.toUpperCase();
    msg.toCharArray(currentMsg, sizeof(currentMsg));
    newMsgReady = true;
    Serial.println("ACK:MSG");
  }

  // CLR — ekranı temizle
  else if (cmd == "CLR") {
    strcpy(currentMsg, " ");
    newMsgReady = true;
    Serial.println("ACK:CLR");
  }

  // BRI:<0-15> — parlaklık
  else if (cmd.startsWith("BRI:")) {
    int bri = cmd.substring(4).toInt();
    bri = constrain(bri, 0, 15);
    display.setIntensity(bri);
    Serial.println("ACK:BRI");
  }

  // PING — bağlantı testi
  else if (cmd == "PING") {
    Serial.println("PONG");
  }
}
