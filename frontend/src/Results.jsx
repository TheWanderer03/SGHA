
import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue, set } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./results.css";


ChartJS.register(ArcElement, Tooltip, Legend);

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCrop = location.state?.selectedCrop || "wheat";

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  

  const [thresholds, setThresholds] = useState(null);
  
  const [metrics, setMetrics] = useState({
    co2: 0,
    temperature: 0,
    humidity: 0,
  });

  const [aiAdvice, setAiAdvice] = useState("Waiting for sensor data...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus("Authenticated");
      } else {
        console.log("No user found, redirecting...");
 
      }
    });
    return unsubscribe;
  }, [navigate]);


  useEffect(() => {
    if (!user) return;

    const cropRef = ref(database, `cropThresholds/${selectedCrop}`);

    const unsubscribe = onValue(cropRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setStatus("Crop data not found");
        return;
      }

      setThresholds(data); 

      const currentMetrics = {
        co2: data.co2?.value || 0,
        temp: data.temperature?.value || 0,
        humidity: data.humidity?.value || 0,
      };

      setMetrics(currentMetrics);
      generateAdvice(data, currentMetrics);
    });

    return unsubscribe;
  }, [user, selectedCrop]);


  const generateAdvice = (limits, current) => {
    let adviceList = [];
    

    if (current.temp < limits.temperature.min) adviceList.push(`Increase Temperature (Low: ${current.temp}°C)`);
    else if (current.temp > limits.temperature.max) adviceList.push(`Decrease Temperature (High: ${current.temp}°C)`);
    

    if (current.humidity < limits.humidity.min) adviceList.push(`Increase Humidity (Low: ${current.humidity}%)`);
    else if (current.humidity > limits.humidity.max) adviceList.push(`Decrease Humidity (High: ${current.humidity}%)`);


    if (current.co2 < limits.co2.min) adviceList.push(`Increase CO2 (Low: ${current.co2}ppm)`);
    else if (current.co2 > limits.co2.max) adviceList.push(`Decrease CO2 (High: ${current.co2}ppm)`);

    setAiAdvice(adviceList.length === 0 ? ` Conditions are perfect for ${selectedCrop}.` : ` Actions: ${adviceList.join(". ")}`);
  };


  const createGaugeData = (value, min, max, label) => {

    let color = '#4CAF50'; 
    if (value < min) color = '#2196F3'; 
    if (value > max) color = '#FF5252'; 

    const remaining = value > max ? 0 : max - value;

    return {
      labels: [label, 'Limit Remaining'],
      datasets: [
        {
          data: [value, remaining],
          backgroundColor: [color, '#E0E0E0'], 
          borderWidth: 0,
          cutout: '70%', 
        },
      ],
    };
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  return (
    <div className="results-container">
      <div className="top-bar">
        <h2>Status: {status}</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h2 className="crop-title">Monitoring: {selectedCrop}</h2>

      <div className="charts-row">
        
        <div className="chart-card">
          <h4>CO₂ Levels</h4>
          <div className="chart-wrapper">
            {thresholds ? (
               <Doughnut data={createGaugeData(metrics.co2, thresholds.co2.min, thresholds.co2.max, "CO2")} />
            ) : <p>Loading...</p>}
          </div>
          <p className="chart-value">{metrics.co2} ppm</p>
        </div>

        <div className="chart-card">
          <h4>Temperature</h4>
          <div className="chart-wrapper">
             {thresholds ? (
               <Doughnut data={createGaugeData(metrics.temp, thresholds.temperature.min, thresholds.temperature.max, "Temp")} />
             ) : <p>Loading...</p>}
          </div>
          <p className="chart-value">{metrics.temp} °C</p>
        </div>

        <div className="chart-card">
          <h4>Humidity</h4>
          <div className="chart-wrapper">
             {thresholds ? (
               <Doughnut data={createGaugeData(metrics.humidity, thresholds.humidity.min, thresholds.humidity.max, "Humidity")} />
             ) : <p>Loading...</p>}
          </div>
          <p className="chart-value">{metrics.humidity} %</p>
        </div>

      </div>

      <div className="advice-section">
        <h3>🤖 Agronomist AI Advice</h3>
        <p>{aiAdvice}</p>
      </div>

    </div>
  );
}