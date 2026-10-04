// RFID ile Müzik Çalar — ESP32 + MFRC522 + OLED
// Kart üzerindeki NDEF (telefonla yazılmış Spotify linki) verisini okur,
// Wi-Fi ile Spotify oEmbed API'sinden şarkı adını çeker ve OLED ekranda
// dönen plak animasyonu + kayan yazı ile gösterir.
// Okunan link, seri port üzerinden bilgisayardaki Python betiğine gönderilir.

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Wi-Fi AYARLARI ---
const char* ssid = "WIFI_ADIN";       // kendi Wi-Fi adınla değiştir
const char* password = "WIFI_SIFREN"; // kendi Wi-Fi şifrenle değiştir

// --- PİN AYARLARI ---
#define RST_PIN 4
#define SS_PIN 5
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

MFRC522 mfrc522(SS_PIN, RST_PIN);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

bool isPlaying = false;
float currentAngle = 0;
String extractedUrl = "";

// Kayan yazı değişkenleri
int textX = 128;
String kayanYazi = "Wi-Fi Baglaniyor... ";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    for (;;);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println("Wi-Fi Baglaniyor...");
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Baglandi!");
  kayanYazi = "Sistem Hazir - Kart Okutun ";

  display.clearDisplay();
  display.setCursor(10, 20);
  display.println("Sistem Hazir.");
  display.setCursor(10, 35);
  display.println("Kart Okutun...");
  display.display();
}

void loop() {
  if (isPlaying) {
    drawSpinningRecord();
  }

  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // --- NDEF ŞİFRE ÇÖZME BÖLÜMÜ ---
  // Telefonlar karta link yazarken sektör şifresini evrensel NDEF
  // anahtarına (D3 F7 D3 F7 D3 F7) çevirir; fabrika şifresiyle (FF FF...)
  // artık okunamaz. Bu yüzden doğrudan bu evrensel anahtarla deniyoruz.
  MFRC522::MIFARE_Key key;
  byte ndefKey[6] = {0xD3, 0xF7, 0xD3, 0xF7, 0xD3, 0xF7};
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = ndefKey[i];
  }

  String fullData = "";
  bool basariliOkuma = false;
  byte bloklar[] = {4, 5, 6, 8, 9, 10}; // URL genelde bu sektörlerde olur

  for (byte i = 0; i < 6; i++) {
    byte block = bloklar[i];
    MFRC522::StatusCode status;
    byte buffer[18];
    byte size = sizeof(buffer);

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));
    if (status == MFRC522::STATUS_OK) {
      status = mfrc522.MIFARE_Read(block, buffer, &size);
      if (status == MFRC522::STATUS_OK) {
        basariliOkuma = true;
        for (byte j = 0; j < 16; j++) {
          if (buffer[j] >= 32 && buffer[j] <= 126) { // yalnız okunabilir ASCII
            fullData += (char)buffer[j];
          }
        }
      }
    }
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  if (basariliOkuma) {
    extractedUrl = parseUrlFromNDEF(fullData);

    if (extractedUrl.length() > 0) {
      // Bilgisayara müziği açması için URL'yi gönder
      Serial.print("URL:");
      Serial.println(extractedUrl);

      isPlaying = true;
      textX = 128;
      kayanYazi = "Spotify'dan Isim Cekiliyor... ";

      // --- İNTERNETTEN ŞARKI ADINI ÇEKME (Spotify oEmbed API) ---
      if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure(); // hız için sertifika doğrulamasını atla
        HTTPClient http;

        String apiUrl = "https://open.spotify.com/oembed?url=" + extractedUrl;
        http.begin(client, apiUrl);

        int httpResponseCode = http.GET();
        if (httpResponseCode > 0) {
          String payload = http.getString();
          DynamicJsonDocument doc(1024);
          DeserializationError error = deserializeJson(doc, payload);

          if (!error) {
            String title = doc["title"].as<String>();
            String author = doc["author_name"].as<String>();
            kayanYazi = title + " - " + author + " ";
          } else {
            kayanYazi = "Sarki Adi Cozulemedi ";
          }
        } else {
          kayanYazi = "API Baglanti Hatasi ";
        }
        http.end();
      } else {
        kayanYazi = "Wi-Fi Koptu ";
      }
    } else {
      Serial.println("HATA: Sektor okundu ama icinde URL bulunamadi.");
    }
  } else {
    Serial.println("HATA: NDEF Sifresi uyusmadi. Kart formatlanmis olabilir.");
  }
}

// Ham bellek metninden Spotify/HTTP bağlantısını çözen fonksiyon
String parseUrlFromNDEF(String raw) {
  int startIndex = -1;

  if (raw.indexOf("open.spotify.com") != -1) startIndex = raw.indexOf("open.spotify.com");
  else if (raw.indexOf("spotify.link") != -1) startIndex = raw.indexOf("spotify.link");
  else if (raw.indexOf("http") != -1) startIndex = raw.indexOf("http");

  if (startIndex != -1) {
    String path = raw.substring(startIndex);
    int endIdx = 0;
    while (endIdx < path.length() && path.charAt(endIdx) >= 33 && path.charAt(endIdx) <= 126) {
      endIdx++;
    }
    path = path.substring(0, endIdx);

    if (path.startsWith("open.spotify") || path.startsWith("spotify.link")) {
      return "https://" + path;
    }
    return path;
  }
  return "";
}

// OLED: dönen plak animasyonu + alt satırda kayan şarkı adı
void drawSpinningRecord() {
  display.clearDisplay();

  int centerX = 64;
  int centerY = 26;
  int radius = 23;

  display.drawCircle(centerX, centerY, radius, SSD1306_WHITE);
  display.drawCircle(centerX, centerY, radius - 2, SSD1306_WHITE);
  display.drawCircle(centerX, centerY, 4, SSD1306_WHITE);

  float rad = currentAngle * 0.0174533;
  int xEnd = centerX + (radius - 4) * cos(rad);
  int yEnd = centerY + (radius - 4) * sin(rad);
  display.drawLine(centerX, centerY, xEnd, yEnd, SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(textX, 55);
  display.print(kayanYazi);
  display.display();

  currentAngle += 20;
  if (currentAngle >= 360) currentAngle = 0;

  textX -= 4; // kayma hızı
  int yaziUzunlugu = kayanYazi.length() * 6;
  if (textX < -yaziUzunlugu) {
    textX = 128;
  }

  delay(40);
}
