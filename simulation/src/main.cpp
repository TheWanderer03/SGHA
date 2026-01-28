#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

// --- USER CONFIGURATION ---
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define DATABASE_SECRET "m6aWJMcLc9YNRtxgl8wQJsYgL0v5FpYGIvcFf9uC" 
#define DATABASE_URL "https://sgca-6bf3a-default-rtdb.asia-southeast1.firebasedatabase.app" 

// --- HARDWARE PINS ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define CO2_PIN 34       // Potentiometer
#define HEATER_PIN 12    // Red LED

// --- OBJECTS ---
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- GLOBAL VARIABLES ---
String cropNames[7] = { "coffee", "cotton", "maize", "rice", "sugarcane", "tea", "wheat" };
int activeFieldCount = 0; 

// --- HELPER FUNCTION: Get Safe Random Value from DB ---
float getSimulatedValue(String cropName, String metric) {
  float minVal = 0;
  float maxVal = 100;
  String basePath = "/cropThresholds/" + cropName + "/" + metric;

  if (Firebase.ready()) {
    if (Firebase.getFloat(fbdo, basePath + "/min")) minVal = fbdo.floatData();
    if (Firebase.getFloat(fbdo, basePath + "/max")) maxVal = fbdo.floatData();
  }

  // Generate random decimal between Min and Max
  float range = maxVal - minVal;
  if (range < 0) range = 0;
  float randomOffset = (random(0, 100) / 100.0) * range;
  
  return minVal + randomOffset;
}

void setup() {
  Serial.begin(115200);
  
  // Hardware Init
  dht.begin();
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  pinMode(HEATER_PIN, OUTPUT);

  // WiFi Init
  lcd.setCursor(0,0);
  lcd.print("WiFi Connecting");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
  lcd.clear();

  // Firebase Init
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET; 
  fbdo.setBSSLBufferSize(4096, 1024); 
  fbdo.setResponseSize(2048);
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // --- 1. LOCAL MONITORING (The "Office" Sensor) ---
  float localTemp = dht.readTemperature();
  float localHum = dht.readHumidity();
  
  // Heater Logic (Local Control)
  if (localTemp < 22.0) {
    digitalWrite(HEATER_PIN, HIGH); // Turn LED ON
  } else {
    digitalWrite(HEATER_PIN, LOW);  // Turn LED OFF
  }

  // Update LCD
  lcd.setCursor(0, 0);
  lcd.print("Local: "); 
  lcd.print((int)localTemp); lcd.print("C "); 
  lcd.print((int)localHum); lcd.print("%");

  // --- 2. CLOUD SIMULATION (The "Fields") ---
  if (Firebase.ready()) {
    // Check how many fields exist
    if (Firebase.getInt(fbdo, "/settings/activeFields")) {
      activeFieldCount = fbdo.intData();
    }
  }

  lcd.setCursor(0, 1);
  lcd.print("Syncing "); lcd.print(activeFieldCount); lcd.print(" Flds ");

  // Loop through every simulated field
  for (int i = 1; i <= activeFieldCount; i++) {
    
    // Identify Crop Type
    int cropID = 2; // Default to Maize
    String cropTypePath = "/crops/field_" + String(i) + "/type";
    
    if (Firebase.ready() && Firebase.getInt(fbdo, cropTypePath)) {
      cropID = fbdo.intData();
    }
    if (cropID < 0 || cropID > 6) cropID = 2;
    String cropName = cropNames[cropID];

    // Generate Data (Fetching Min/Max from DB)
    float simTemp = getSimulatedValue(cropName, "temperature");
    float simHum  = getSimulatedValue(cropName, "humidity");
    float simCO2  = getSimulatedValue(cropName, "co2");

    // Upload Data
    String uploadPath = "/crops/field_" + String(i);
    if (Firebase.ready()) {
      Firebase.setFloat(fbdo, uploadPath + "/temp", simTemp);
      Firebase.setFloat(fbdo, uploadPath + "/humidity", simHum);
      Firebase.setInt(fbdo, uploadPath + "/co2", (int)simCO2);
      
      Serial.print("Synced Field "); Serial.print(i);
      Serial.print(" (" + cropName + ")");
      Serial.print(" -> T:"); Serial.println(simTemp);
    }
    delay(50); // Small delay for stability
  }

  delay(2000); // Wait before next update cycle
}