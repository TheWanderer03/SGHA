import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue, set } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "./results.css";

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedCrop = location.state?.selectedCrop;

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [metrics, setMetrics] = useState({
    co2: 0,
    temperature: 0,
    humidity: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }
      setUser(currentUser);
      setStatus("Authenticated");
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (!user || !selectedCrop) return;

    const selectedCropRef = ref(database, "selectedCrop");

    set(selectedCropRef, selectedCrop)
      .then(() => {
        setStatus(`Live data for ${selectedCrop}`);
      })
      .catch((err) => {
        console.error("Failed to set selectedCrop:", err);
        setStatus("Failed to select crop");
      });

  }, [user, selectedCrop]);

  useEffect(() => {
    if (!user || !selectedCrop) return;

    const cropRef = ref(database, `cropThresholds/${selectedCrop}`);

    const unsubscribe = onValue(
      cropRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setStatus("Waiting for crop data...");
          return;
        }

        setMetrics({
          co2: data?.co2?.value ?? 0,
          temperature: data?.temperature?.value ?? 0,
          humidity: data?.humidity?.value ?? 0,
        });
      },
      (error) => {
        console.error("Database error:", error.message);
        setStatus("Permission denied");
      }
    );

    return unsubscribe;
  }, [user, selectedCrop]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  return (
    <div className="results-container">
      <div className="top-bar">
        <h2>Status: {status}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <h2 className="crop-title">
        Selected Crop: <span>{selectedCrop || "None"}</span>
      </h2>

      <div className="card-grid">
        <div className="card">
          <h3>CO₂ Level</h3>
          <p>{metrics.co2} ppm</p>
        </div>

        <div className="card">
          <h3>Temperature</h3>
          <p>{metrics.temperature} °C</p>
        </div>

        <div className="card">
          <h3>Humidity</h3>
          <p>{metrics.humidity} %</p>
        </div>
      </div>
    </div>
  );
}