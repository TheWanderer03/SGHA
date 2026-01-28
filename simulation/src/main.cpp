#include <WiFi.h>
#include <FirebaseESP32.h>
#include "DHT.h"
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

// --- Configuration ---
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define DATABASE_SECRET "m6aWJMcLc9YNRtxgl8wQJsYgL0v5FpYGIvcFf9uC" 
#define DATABASE_URL "https://sgca-6bf3a-default-rtdb.asia-southeast1.firebasedatabase.app" 

#define DHTPIN 4
#define DHTTYPE DHT22
#define CO2_PIN 34
#define HEATER_RELAY 12

// --- Objects ---
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  dht.begin();
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  pinMode(HEATER_RELAY, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET; 
  
  fbdo.setBSSLBufferSize(4096, 1024); 
  fbdo.setResponseSize(2048);

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int co2Raw = analogRead(CO2_PIN);
  int baseCO2 = map(co2Raw, 0, 4095, 800, 2000);

  t += (random(-5, 6) / 10.0);
  h += (random(-10, 11) / 10.0); 
  int finalCO2 = baseCO2 + random(-10, 11); 


  if (t < 22.0) {
    digitalWrite(HEATER_RELAY, HIGH);
  } else {
    digitalWrite(HEATER_RELAY, LOW);
  }

 
  if (Firebase.ready()) {
    Firebase.setFloat(fbdo, "/greenhouse/temp", t);
    Firebase.setFloat(fbdo, "/greenhouse/humidity", h);
    Firebase.setInt(fbdo, "/greenhouse/co2", finalCO2);
    
    Serial.print("Synced -> T:"); Serial.print(t);
    Serial.print(" H:"); Serial.print(h);
    Serial.print(" C:"); Serial.println(finalCO2);
  }


  lcd.setCursor(0, 0);
  lcd.print("T:"); lcd.print(t, 1); lcd.print("C ");
  lcd.print("H:"); lcd.print(h, 0); lcd.print("%  ");

  lcd.setCursor(0, 1);
  lcd.print("CO2: "); lcd.print(finalCO2); lcd.print(" ppm    ");

  delay(2000); 
}