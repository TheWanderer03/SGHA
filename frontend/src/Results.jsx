import React, { useEffect, useState, useRef } from "react"; // NEW: Added useRef
import { database, auth } from "./firebase";
import { ref, onValue, set } from "firebase/database"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./results.css";

ChartJS.register(ArcElement, Tooltip, Legend);

// NEW: sound file (You can replace this URL with a local file like "/alert.mp3")
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCrop = location.state?.selectedCrop || "wheat";

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const [thresholds, setThresholds] = useState(null);
  const [metrics, setMetrics] = useState({ co2: 0, temp: 0, humidity: 0 });
  const [aiAdvice, setAiAdvice] = useState(null);
  
  // NEW: State for mute and Audio ref
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(new Audio(ALERT_SOUND_URL));
  const lastPlayedRef = useRef(0); // To prevent sound spamming

  // 1. Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus("System Online");
      }
    });
    return unsubscribe;
  }, []);

  // 2. Notify ESP32
  useEffect(() => {
    if (!user || !selectedCrop) return;
    set(ref(database, "selectedCrop"), selectedCrop);
  }, [user, selectedCrop]);

  // 3. Listen for Sensor Updates
  useEffect(() => {
    if (!user) return;
    const cropRef = ref(database, `cropThresholds/${selectedCrop}`);

    return onValue(cropRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setStatus("Waiting for ESP32...");
        return;
      }
      
      const currentMetrics = {
        co2: data.co2?.value || 0,
        temp: data.temperature?.value || 0,
        humidity: data.humidity?.value || 0,
      };

      setThresholds(data);
      setMetrics(currentMetrics);
      generateAdvice(data, currentMetrics);
    });
  }, [user, selectedCrop]);

  const generateAdvice = (limits, current) => {
    let adviceList = [];

    // Logic Checks
    if (current.temp < (limits.temperature?.min || 0)) adviceList.push(`❄️ Low Temp: Heat to ${limits.temperature?.min}°C.`);
    if (current.temp > (limits.temperature?.max || 100)) adviceList.push(`🔥 High Temp: Activate cooling.`);
    if (current.humidity < (limits.humidity?.min || 0)) adviceList.push(`💧 Low Humidity: Turn on irrigation.`);
    if (current.humidity > (limits.humidity?.max || 100)) adviceList.push(`🌫️ High Humidity: Increase ventilation.`);
    if (current.co2 < (limits.co2?.min || 0)) adviceList.push(`🍃 Low CO2: Increase air circulation.`);

    setAiAdvice(adviceList);

    // NEW: Play Sound Logic
    // Only play if there are warnings, not muted, and 5 seconds have passed since last beep
    if (adviceList.length > 0 && !isMuted) {
      const now = Date.now();
      if (now - lastPlayedRef.current > 5000) { // 5000ms = 5 seconds delay
        audioRef.current.play().catch(e => console.log("Audio blocked by browser:", e));
        lastPlayedRef.current = now;
      }
    }
  };

  const createGaugeData = (value, min, max, label) => {
    const color = value < min ? '#2979ff' : value > max ? '#ff1744' : '#00e676';
    return {
      labels: [label, 'Limit'],
      datasets: [{
        data: [value, (max > value ? max - value : 0)],
        backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
        borderWidth: 0,
        cutout: '75%',
        borderRadius: 10,
      }],
    };
  };

  return (
    <div className="results-container-wrapper">
      <div className="dashboard-glass">
        <div className="top-bar">
          <div className="status-indicator"><span className="dot"></span> {status}</div>
          <div className="nav-buttons">
            {/* NEW: Mute Button */}
            <button className="nav-btn mute-btn" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
            
            <button className="nav-btn home-btn" onClick={() => navigate("/homepage")}>Home</button>
            <button className="nav-btn logout-btn" onClick={() => signOut(auth).then(() => navigate("/"))}>Logout</button>
          </div>
        </div>

        <h2 className="crop-title">Monitoring: <span className="highlight">{selectedCrop}</span></h2>

        <div className="charts-row">
          {['CO₂', 'Temp', 'Humidity'].map((label) => {
            const key = label === 'CO₂' ? 'co2' : label === 'Temp' ? 'temp' : 'humidity';
            const limitKey = label === 'Temp' ? 'temperature' : key;
            const unit = label === 'CO₂' ? 'ppm' : label === 'Temp' ? '°C' : '%';
            
            return (
              <div className="chart-card" key={label}>
                <h4>{label}</h4>
                <div className="chart-wrapper">
                  {thresholds ? (
                    <Doughnut data={createGaugeData(metrics[key], thresholds[limitKey]?.min || 0, thresholds[limitKey]?.max || 100, label)} />
                  ) : <p>...</p>}
                </div>
                <p className="chart-value">{Number(metrics[key]).toFixed(2)} <span className="unit">{unit}</span></p>
              </div>
            );
          })}
        </div>

        <div className="advice-section">
          <h3>🤖 AI Agronomist Insights</h3>
          <div className="advice-content">
            {aiAdvice === null ? (
                <p className="loading-text">Waiting for sensor data...</p>
            ) : aiAdvice.length === 0 ? (
                <div className="optimal-state">
                    <span className="check-icon">✅</span>
                    <p>All environmental conditions are optimal.</p>
                </div>
            ) : (
                <ul className="advice-list">
                    {aiAdvice.map((tip, index) => (
                        <li key={index} className="advice-item">{tip}</li>
                    ))}
                </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}