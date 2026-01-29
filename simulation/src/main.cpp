#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

// --- USER CONFIGURATION ---
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define DATABASE_SECRET "m6aWJMcLc9YNRtxgl8wQJsYgL0v5FpYGIvcFf9uC" 

// IMPORTANT: No "https://"
#define DATABASE_URL "sgca-6bf3a-default-rtdb.asia-southeast1.firebasedatabase.app" 

// --- HARDWARE PINS ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define HEATER_PIN 12    

// --- OBJECTS ---
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- GLOBAL VARIABLES ---
String selectedCrop = ""; 

float getSimulatedValue(String cropName, String metric) {
  float minVal = 0;
  float maxVal = 100;
  String basePath = "/cropThresholds/" + cropName + "/" + metric;

  if (Firebase.ready()) {
    if (Firebase.getFloat(fbdo, basePath + "/min")) minVal = fbdo.floatData();
    if (Firebase.getFloat(fbdo, basePath + "/max")) maxVal = fbdo.floatData();
  }
  
  float range = maxVal - minVal;
  if (range < 0) range = 0;
  return minVal + (random(0, 100) / 100.0) * range;
}

void setup() {
  Serial.begin(115200);
  
  // 1. Hardware Init
  dht.begin();
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  pinMode(HEATER_PIN, OUTPUT);
  Serial.println("Hardware Initialized");

  // 2. WiFi Connection
  lcd.setCursor(0,0);
  lcd.print("WiFi Connecting");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
  lcd.clear();

  // 3. Firebase Init
  Serial.println("Connecting to Firebase...");
  
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET; 
  
  // REMOVED BUFFER SETTINGS TO PREVENT CRASH
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("Setup Complete.");
}

void loop() {
  if (!Firebase.ready()) {
    Serial.println("Connecting...");
    delay(1000);
    return;
  }

  // --- 1. READ SELECTION ---
  if (Firebase.getString(fbdo, "/selectedCrop")) {
    selectedCrop = fbdo.stringData();
    Serial.print("Target Crop: "); 
    Serial.println(selectedCrop);
  } else {
    Serial.print("Read Error: ");
    Serial.println(fbdo.errorReason());
  }

  // --- 2. UPDATE DATA ---
  if (selectedCrop != "") {
    
    // Simulate Data
    float simTemp = getSimulatedValue(selectedCrop, "temperature");
    float simHum  = getSimulatedValue(selectedCrop, "humidity");
    float simCO2  = getSimulatedValue(selectedCrop, "co2");

    String basePath = "/cropThresholds/" + selectedCrop;

    // Write Data
    if (Firebase.setFloat(fbdo, basePath + "/temperature/value", simTemp)) {
       
       Firebase.setFloat(fbdo, basePath + "/humidity/value", simHum);
       Firebase.setInt(fbdo,   basePath + "/co2/value", (int)simCO2);

       Serial.print("UPDATED: "); Serial.println(simTemp);

       // Update LCD
       lcd.setCursor(0, 0);
       lcd.print(selectedCrop); lcd.print("      ");
       lcd.setCursor(0, 1);
       lcd.print("T:"); lcd.print((int)simTemp); 
       lcd.print(" H:"); lcd.print((int)simHum);
       
    } else {
       Serial.print("WRITE ERROR: ");
       Serial.println(fbdo.errorReason());
    }
  } else {
    Serial.println("Waiting for crop selection...");
    lcd.setCursor(0, 0); lcd.print("Select Crop...");
  }

  delay(2000); 
}