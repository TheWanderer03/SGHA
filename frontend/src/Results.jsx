import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";
import "./results.css"

export function Results() {
  const [co2, setCo2] = useState(0);
  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);

  // 1. Log immediately when the function loads
  console.log("🚀 Results Component has started rendering!");

  useEffect(() => {
    console.log("⚡ useEffect is running...");
    
    // 2. Check if database is initialized
    if (!database) {
      console.error("❌ Database object is missing! Check firebase.js");
      return;
    }
    console.log("Tb Database object found. Connecting to 'greenhouse'...");

    const sensorRef = ref(database, "greenhouse");

    // 3. Set up the listener
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      console.log("📡 Firebase responded!"); // We should see this if connected
      
      const data = snapshot.val();
      console.log("📦 Data received:", data); // This shows the actual object

      if (data) {
        setCo2(data.co2);
        setTemp(data.temp);
        setHumidity(data.humidity);
      } else {
        console.warn("⚠️ Data is NULL. Path 'greenhouse' might be empty.");
      }
    }, (error) => {
      // 4. Catch permission errors
      console.error("❌ Firebase Error:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="results-container">
      <p>
        the amount of CO2 in the atmosphere is {co2} ppm
      </p>
      <p>
        the temperature of the atmosphere is {temp} degrees celsius
      </p>
      <p>
        the humidity in the atmosphere is {humidity} %
      </p>
    </div>
  )
}