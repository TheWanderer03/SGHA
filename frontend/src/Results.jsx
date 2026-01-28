import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";
import "./results.css"

export function Results() {
  const [co2, setCo2] = useState(0);
  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);

  useEffect(() => {
    const sensorRef = ref(database, "greenhouse");

    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCo2(data.co2);
        setTemp(data.temp);
        setHumidity(data.humidity);
      }
    });
  }, []);
  return (
    <div className="results-container">
      <p>
        the amount of CO2 in the atmosphere is {co2}%
      </p>
      <p>
        the temperature of the atmosphere is {temp}ppm
      </p>
      <p>
        the humidity in the atmosphere is {humidity}
      </p>
    </div>
  )

}