# RFID ile Müzik Çalar — bilgisayar tarafı
# ESP32'den seri port üzerinden gelen "URL:..." mesajını dinler,
# gelen Spotify linkini doğrudan tarayıcıda/Spotify uygulamasında açar.
# Şarkı adını artık ESP32 kendisi Wi-Fi ile Spotify'dan çektiği için
# bu tarafta hiçbir eşleştirme listesi tutmaya gerek yok.

import serial
import webbrowser

SERIAL_PORT = 'COM5'  # ESP32'nin bağlı olduğu portu buraya yaz
BAUD_RATE = 115200

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    print(f"[{SERIAL_PORT}] Bekleniyor... Anahtarligi okutun.")

    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8', errors='ignore').strip()

            if line.startswith("URL:"):
                url = line.split("URL:")[1].strip()
                print(f"[+] Karttan Okunan Link: {url}")
                print("[-] Spotify aciliyor...\n")
                webbrowser.open(url)
            else:
                print(f"ESP32 Mesaji: {line}")

except Exception as e:
    print("Baglanti Hatasi:", e)
