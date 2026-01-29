import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./results.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCrop = location.state?.selectedCrop || "wheat";

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const [thresholds, setThresholds] = useState(null);
  
  const [metrics, setMetrics] = useState({
    co2: 0,
    temp: 0,
    humidity: 0,
  });

  const [aiAdvice, setAiAdvice] = useState("Waiting for sensor data...");

  // --- Auth Check ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus("System Online");
      } else {
         // navigate("/"); // Uncomment in production to force login
      }
    });
    return unsubscribe;
  }, [navigate]);

  // --- Data Listener ---
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

  // --- AI Advice Logic ---
  const generateAdvice = (limits, current) => {
    let adviceList = [];
    
    if (current.temp < limits.temperature.min) adviceList.push(`Increase Temp (Low: ${current.temp}°C)`);
    else if (current.temp > limits.temperature.max) adviceList.push(`Lower Temp (High: ${current.temp}°C)`);
    
    if (current.humidity < limits.humidity.min) adviceList.push(`Increase Humidity (Low: ${current.humidity}%)`);
    else if (current.humidity > limits.humidity.max) adviceList.push(`Lower Humidity (High: ${current.humidity}%)`);

    if (current.co2 < limits.co2.min) adviceList.push(`Increase CO2 (Low: ${current.co2}ppm)`);
    else if (current.co2 > limits.co2.max) adviceList.push(`Decrease CO2 (High: ${current.co2}ppm)`);

    setAiAdvice(adviceList.length === 0 ? `✅ Optimal conditions for ${selectedCrop}.` : `⚠️ Action Needed: ${adviceList.join(" | ")}`);
  };

  // --- Chart Data Helper (Dark Mode Optimized) ---
  const createGaugeData = (value, min, max, label) => {
    let color = '#00e676'; // Bright Green (Good)
    if (value < min) color = '#2979ff'; // Blue (Low)
    if (value > max) color = '#ff1744'; // Red (High)

    const remaining = value > max ? 0 : max - value;

    return {
      labels: [label, 'Remaining'],
      datasets: [
        {
          data: [value, remaining],
          backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'], // Transparent track
          borderWidth: 0,
          cutout: '75%', 
          borderRadius: 10,
        },
      ],
    };
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  // ---------- FIX IS HERE ----------
  const handleHome = () => {
    // Change this string to match your Route path in App.js
    navigate("/homepage"); 
  };
  // ---------------------------------

  return (
    <div className="results-container-wrapper">
      <div className="blob blob-results-1"></div>
      <div className="blob blob-results-2"></div>

      <div className="dashboard-glass">
        {/* Top Navigation */}
        <div className="top-bar">
          <div className="status-indicator">
            <span className="dot"></span> {status}
          </div>
          <div className="nav-buttons">
            <button className="nav-btn home-btn" onClick={handleHome}>Home</button>
            <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <h2 className="crop-title">
          Monitoring: <span className="highlight">{selectedCrop}</span>
        </h2>

        {/* Charts Section */}
        <div className="charts-row">
          <div className="chart-card">
            <h4>CO₂ Levels</h4>
            <div className="chart-wrapper">
              {thresholds ? (
                 <Doughnut data={createGaugeData(metrics.co2, thresholds.co2.min, thresholds.co2.max, "CO2")} />
              ) : <p className="loading">Loading...</p>}
            </div>
            <p className="chart-value">{metrics.co2} <span className="unit">ppm</span></p>
          </div>

          <div className="chart-card">
            <h4>Temperature</h4>
            <div className="chart-wrapper">
               {thresholds ? (
                 <Doughnut data={createGaugeData(metrics.temp, thresholds.temperature.min, thresholds.temperature.max, "Temp")} />
               ) : <p className="loading">Loading...</p>}
            </div>
            <p className="chart-value">{metrics.temp} <span className="unit">°C</span></p>
          </div>

          <div className="chart-card">
            <h4>Humidity</h4>
            <div className="chart-wrapper">
               {thresholds ? (
                 <Doughnut data={createGaugeData(metrics.humidity, thresholds.humidity.min, thresholds.humidity.max, "Humidity")} />
               ) : <p className="loading">Loading...</p>}
            </div>
            <p className="chart-value">{metrics.humidity} <span className="unit">%</span></p>
          </div>
        </div>

        {/* Advice Section */}
        <div className="advice-section">
          <h3>AI Agronomist Insights</h3>
          <p>{aiAdvice}</p>
        </div>

      </div>
    </div>
  );
}
