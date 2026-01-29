//   // import React, { useEffect, useState } from "react";
//   // import { database, auth } from "./firebase";
//   // import { ref, onValue, set } from "firebase/database";
//   // import { onAuthStateChanged, signOut } from "firebase/auth";
//   // import { useNavigate, useLocation } from "react-router-dom";
//   // import "./results.css";

//   // export function Results() {
//   //   const navigate = useNavigate();
//   //   const location = useLocation();

//   //   const selectedCrop = location.state?.selectedCrop;

//   //   const [user, setUser] = useState(null);
//   //   const [status, setStatus] = useState("Initializing...");
//   //   const [metrics, setMetrics] = useState({
//   //     co2: 0,
//   //     temp: 0,
//   //     humidity: 0,
//   //   });

//   //   useEffect(() => {
//   //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//   //       if (!currentUser) {
//   //         navigate("/");
//   //         return;
//   //       }
//   //       setUser(currentUser);
//   //       setStatus("Authenticated");
//   //     });

//   //     return unsubscribe;
//   //   }, [navigate]);

//   //   useEffect(() => {
//   //     if (!user || !selectedCrop) return;

//   //     const selectedCropRef = ref(database, "selectedCrop");

//   //     set(selectedCropRef, selectedCrop)
//   //       .then(() => {
//   //         setStatus(`Live data for ${selectedCrop}`);
//   //       })
//   //       .catch((err) => {
//   //         console.error("Failed to set selectedCrop:", err);
//   //         setStatus("Failed to select crop");
//   //       });

//   //   }, [user, selectedCrop]);

//   //   useEffect(() => {
//   //     if (!user || !selectedCrop) return;

//   //     const cropRef = ref(database, `cropThresholds/${selectedCrop}`);

//   //     const unsubscribe = onValue(
//   //       cropRef,
//   //       (snapshot) => {
//   //         const data = snapshot.val();

//   //         if (!data) {
//   //           setStatus("Waiting for crop data...");
//   //           return;
//   //         }

//   //         setMetrics({
//   //           co2: data?.co2?.value ?? 0,
//   //           temp: data?.temp?.value ?? 0,
//   //           humidity: data?.humidity?.value ?? 0,
//   //         });
//   //       },
//   //       (error) => {
//   //         console.error("Database error:", error.message);
//   //         setStatus("Permission denied");
//   //       }
//   //     );

//   //     return unsubscribe;
//   //   }, [user, selectedCrop]);

//   //   const handleLogout = () => {
//   //     signOut(auth).then(() => navigate("/"));
//   //   };

//   //   return (
//   //     <div className="results-container">
//   //       <div className="top-bar">
//   //         <h2>Status: {status}</h2>
//   //         <button className="logout-btn" onClick={handleLogout}>
//   //           Logout
//   //         </button>
//   //       </div>

//   //       <h2 className="crop-title">
//   //         Selected Crop: <span>{selectedCrop || "None"}</span>
//   //       </h2>

//   //       <div className="card-grid">
//   //         <div className="card">
//   //           <h3>CO₂ Level</h3>
//   //           <p>{metrics.co2} ppm</p>
//   //         </div>

//   //         <div className="card">
//   //           <h3>Temperature</h3>
//   //           <p>{metrics.temp} °C</p>
//   //         </div>

//   //         <div className="card">
//   //           <h3>Humidity</h3>
//   //           <p>{metrics.humidity} %</p>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   import React, { useEffect, useState } from "react";
// import { database, auth } from "./firebase";
// import { ref, onValue, set } from "firebase/database";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import { Pie } from "react-chartjs-2";
// import "./results.css";

// // 1. Register Chart.js components
// ChartJS.register(ArcElement, Tooltip, Legend);

// export function Results() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Safe fallback if user navigates directly without state
//   const selectedCrop = location.state?.selectedCrop || "wheat";

//   const [user, setUser] = useState(null);
//   const [status, setStatus] = useState("Initializing...");
  
//   // State for Metrics
//   const [metrics, setMetrics] = useState({
//     co2: 0,
//     temp: 0,
//     humidity: 0,
//   });

//   // State for AI & Charts
//   const [aiAdvice, setAiAdvice] = useState("Waiting for sensor data...");
//   const [chartData, setChartData] = useState(null);

//   // --- 1. Authentication Check ---
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (!currentUser) {
//         navigate("/");
//         return;
//       }
//       setUser(currentUser);
//       setStatus("Authenticated");
//     });
//     return unsubscribe;
//   }, [navigate]);

//   // --- 2. Update 'selectedCrop' in Database ---
//   useEffect(() => {
//     if (!user || !selectedCrop) return;

//     const selectedCropRef = ref(database, "selectedCrop");
//     set(selectedCropRef, selectedCrop)
//       .then(() => setStatus(`Live data for ${selectedCrop}`))
//       .catch((err) => {
//         console.error("Failed to set selectedCrop:", err);
//         setStatus("Failed to select crop");
//       });
//   }, [user, selectedCrop]);

//   // --- 3. Listen to Realtime Data & Generate Analysis ---
//   useEffect(() => {
//     if (!user || !selectedCrop) return;

//     const cropRef = ref(database, `cropThresholds/${selectedCrop}`);

//     const unsubscribe = onValue(cropRef, (snapshot) => {
//       const data = snapshot.val();

//       if (!data) {
//         setStatus("Waiting for crop data...");
//         return;
//       }

//       // A. Update Basic Metrics
//       const currentMetrics = {
//         co2: data?.co2?.value ?? 0,
//         temp: data?.temperature?.value ?? 0, // Note: Changed 'temp' to 'temperature' to match your JSON structure
//         humidity: data?.humidity?.value ?? 0,
//       };
//       setMetrics(currentMetrics);

//       // B. Analyze Data for AI Advice & Charts
//       analyzeCropHealth(data, currentMetrics);
//     }, (error) => {
//       console.error("Database error:", error.message);
//       setStatus("Permission denied");
//     });

//     return unsubscribe;
//   }, [user, selectedCrop]);

//   // --- Helper: Logic-based "AI" Analysis ---
//   const analyzeCropHealth = (thresholds, current) => {
//     let goodCount = 0;
//     let badCount = 0;
//     let adviceList = [];

//     // Check Temperature
//     if (current.temp < thresholds.temperature.min) {
//       badCount++;
//       adviceList.push(`Temperature is too low (${current.temp}°C). Consider using heaters or closing vents.`);
//     } else if (current.temp > thresholds.temperature.max) {
//       badCount++;
//       adviceList.push(`Temperature is too high (${current.temp}°C). Increase ventilation or shade immediately.`);
//     } else {
//       goodCount++;
//     }

//     // Check Humidity
//     if (current.humidity < thresholds.humidity.min) {
//       badCount++;
//       adviceList.push(`Humidity is critically low (${current.humidity}%). Activate misting system.`);
//     } else if (current.humidity > thresholds.humidity.max) {
//       badCount++;
//       adviceList.push(`Humidity is too high (${current.humidity}%). Ensure good airflow to prevent fungal growth.`);
//     } else {
//       goodCount++;
//     }

//     // Check CO2
//     if (current.co2 < thresholds.co2.min) {
//       badCount++;
//       adviceList.push(`CO2 levels are low (${current.co2} ppm). Ventilation might be excessive.`);
//     } else if (current.co2 > thresholds.co2.max) {
//       badCount++;
//       adviceList.push(`CO2 levels are high (${current.co2} ppm). Check air circulation.`);
//     } else {
//       goodCount++;
//     }

//     // Update Advice State
//     if (adviceList.length === 0) {
//       setAiAdvice(`✅ Optimal conditions for ${selectedCrop}. No actions required.`);
//     } else {
//       setAiAdvice(`⚠️ Attention Needed: ${adviceList.join(" ")}`);
//     }

//     // Update Chart Data
//     setChartData({
//       labels: ['Healthy Parameters', 'Critical Parameters'],
//       datasets: [
//         {
//           data: [goodCount, badCount],
//           backgroundColor: ['#4CAF50', '#FF5252'], // Green vs Red
//           borderColor: ['#388E3C', '#D32F2F'],
//           borderWidth: 1,
//         },
//       ],
//     });
//   };

//   const handleLogout = () => {
//     signOut(auth).then(() => navigate("/"));
//   };

//   return (
//     <div className="results-container">
//       {/* Header Section */}
//       <div className="top-bar">
//         <h2>Status: {status}</h2>
//         <button className="logout-btn" onClick={handleLogout}>Logout</button>
//       </div>

//       <h2 className="crop-title">
//         Monitoring: <span style={{ textTransform: 'capitalize' }}>{selectedCrop}</span>
//       </h2>

//       {/* Main Content Grid */}
//       <div className="dashboard-layout">
        
//         {/* LEFT COLUMN: Metrics Cards */}
//         <div className="card-column">
//           <div className="card-grid">
//             <div className="card">
//               <h3>CO₂ Level</h3>
//               <p>{metrics.co2} <span className="unit">ppm</span></p>
//             </div>
//             <div className="card">
//               <h3>Temperature</h3>
//               <p>{metrics.temp} <span className="unit">°C</span></p>
//             </div>
//             <div className="card">
//               <h3>Humidity</h3>
//               <p>{metrics.humidity} <span className="unit">%</span></p>
//             </div>
//           </div>
          
//           {/* AI Advice Box */}
//           <div className="advice-box">
//              <h3>🤖 AI Agronomist Advice</h3>
//              <p>{aiAdvice}</p>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: Chart */}
//         <div className="chart-column">
//           <div className="chart-card">
//             <h3>System Health</h3>
//             {chartData ? (
//               <div className="chart-wrapper">
//                 <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
//               </div>
//             ) : (
//               <p>Loading Chart...</p>
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue, set } from "firebase/database";
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
  const [status, setStatus] = useState("Initializing...");
  
  // Store thresholds to calculate chart limits
  const [thresholds, setThresholds] = useState(null);
  
  const [metrics, setMetrics] = useState({
    co2: 0,
    temperature: 0,
    humidity: 0,
  });

  const [aiAdvice, setAiAdvice] = useState("Waiting for sensor data...");

  // --- Auth Check ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus("Authenticated");
      } else {
        console.log("No user found, redirecting...");
        // navigate("/"); // Uncomment this after testing
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

      setThresholds(data); // Save full threshold object for charts

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
    
    // Temp
    if (current.temp < limits.temperature.min) adviceList.push(`Increase Temperature (Low: ${current.temp}°C)`);
    else if (current.temp > limits.temperature.max) adviceList.push(`Decrease Temperature (High: ${current.temp}°C)`);
    
    // Humidity
    if (current.humidity < limits.humidity.min) adviceList.push(`Increase Humidity (Low: ${current.humidity}%)`);
    else if (current.humidity > limits.humidity.max) adviceList.push(`Decrease Humidity (High: ${current.humidity}%)`);

    // CO2
    if (current.co2 < limits.co2.min) adviceList.push(`Increase CO2 (Low: ${current.co2}ppm)`);
    else if (current.co2 > limits.co2.max) adviceList.push(`Decrease CO2 (High: ${current.co2}ppm)`);

    setAiAdvice(adviceList.length === 0 ? `✅ Conditions are perfect for ${selectedCrop}.` : `⚠️ Actions: ${adviceList.join(". ")}`);
  };

  // --- Helper: Generate Chart Data for Single Metric ---
  const createGaugeData = (value, min, max, label) => {
    // Determine Color based on health
    let color = '#4CAF50'; // Green (Good)
    if (value < min) color = '#2196F3'; // Blue (Too Low)
    if (value > max) color = '#FF5252'; // Red (Too High)

    // Calculate "Remaining" slice to make it look like a gauge
    // If value > max, the chart is 100% full
    const remaining = value > max ? 0 : max - value;

    return {
      labels: [label, 'Limit Remaining'],
      datasets: [
        {
          data: [value, remaining],
          backgroundColor: [color, '#E0E0E0'], // Value Color vs Grey Background
          borderWidth: 0,
          cutout: '70%', // Makes it a thin doughnut
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

      {/* 1. The 3 Charts Section */}
      <div className="charts-row">
        
        {/* CO2 Chart */}
        <div className="chart-card">
          <h4>CO₂ Levels</h4>
          <div className="chart-wrapper">
            {thresholds ? (
               <Doughnut data={createGaugeData(metrics.co2, thresholds.co2.min, thresholds.co2.max, "CO2")} />
            ) : <p>Loading...</p>}
          </div>
          <p className="chart-value">{metrics.co2} ppm</p>
        </div>

        {/* Temperature Chart */}
        <div className="chart-card">
          <h4>Temperature</h4>
          <div className="chart-wrapper">
             {thresholds ? (
               <Doughnut data={createGaugeData(metrics.temp, thresholds.temperature.min, thresholds.temperature.max, "Temp")} />
             ) : <p>Loading...</p>}
          </div>
          <p className="chart-value">{metrics.temp} °C</p>
        </div>

        {/* Humidity Chart */}
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

      {/* 2. Advice Section */}
      <div className="advice-section">
        <h3>🤖 Agronomist AI Advice</h3>
        <p>{aiAdvice}</p>
      </div>

    </div>
  );
}