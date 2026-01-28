import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase"; 
import { ref, onValue } from "firebase/database"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom"; 
import "./results.css"

export function Results() {
  const navigate = useNavigate();
  
  const [co2, setCo2] = useState(0);
  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Initializing...");

<<<<<<< HEAD
  // 1. AUTH LISTENER
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus("Logged in. connecting to greenhouse...");
      } else {
        navigate("/"); // Kick out if not logged in
=======
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
>>>>>>> 9e402c5b108165c5ccd9b09a54ac8d14a07195a3
      }
    }, (error) => {
      // 4. Catch permission errors
      console.error("❌ Firebase Error:", error);
    });
<<<<<<< HEAD
    return () => unsubscribeAuth();
  }, [navigate]);

  // 2. DATA LISTENER (Only runs AFTER 'user' is found)
  useEffect(() => {
    if (!user) return; // <--- STOP here if not logged in (Prevents Permission Error)

    const sensorRef = ref(database, 'greenhouse');
    
    const unsubscribeDB = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      console.log("🔥 DATA RECEIVED:", data); // Check Console for this!

      if (data) {
        setStatus("Live");
        // --- THE MAGIC FIX (Handles uppercase/lowercase/typos) ---
        setCo2(data.co2 || data.CO2 || data.Co2 || 0);
        setTemp(data.temp || data.Temp || data.Temperature || data.temperature || 0);
        setHumidity(data.humidity || data.Humidity || 0);
      } else {
        setStatus("Waiting for ESP32 data...");
      }
    }, (error) => {
      console.error("❌ PERMISSION ERROR:", error.message);
      setStatus("Error: Permission Denied. Check Rules.");
    });

    return () => unsubscribeDB();
  }, [user]); // Dependency ensures this waits for login

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  return (
    <div className="results-container">
      <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{margin:0}}>Status: {status}</h2>
        <button onClick={handleLogout} style={{background:'#ff5252', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>
          Logout
        </button>
      </div>

      <div className="card-grid">
         <div className="card">
            <h3>CO2 Level</h3>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{co2} ppm</p>
         </div>
         <div className="card">
            <h3>Temperature</h3>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{temp} °C</p>
         </div>
         <div className="card">
            <h3>Humidity</h3>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{humidity} %</p>
         </div>
      </div>
=======

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
>>>>>>> 9e402c5b108165c5ccd9b09a54ac8d14a07195a3
    </div>
  )
}