import './homepage.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'


export function HomePage() {
  const navigate = useNavigate()

  const [selectedCrop, setSelectedCrop] = useState("")
  const goToResults = () => {
    if (!selectedCrop) {
      alert("Please select a crop");
      return;
    }

    navigate("/results", {
      state: {
        selectedCrop: selectedCrop
      }
    });
  };

  return (
    <>
      <div className="header">
        <h1 className="title">
          KANAM 2026 HACKATHON
        </h1>

      </div>
      <div className="problem-statement">
        <p>
          Smart Greenhouse Climate Analytics
        </p>
        <p>
          Theme Explanation:
        </p>
        <p>
          Uses climate sensors data to regulate temperature, humidity and CO2 levels enhancing sustainable crop growth
        </p>
      </div>
      <select id="course" name="course" className="crop-drop" value={selectedCrop}
        onChange={(e) => setSelectedCrop(e.target.value)}>
        <option value="">Select the crop</option>
        <option value="coffee">coffee</option>
        <option value="cotton">cotton</option>
        <option value="maize">maize</option>
        <option value="rice">rice</option>
        <option value="sugarcane">sugarcane</option>
        <option value="tea">tea</option>
        <option value="wheat">wheat</option>
      </select>
      <button className="retrieve-button" role="button" onClick={goToResults}>continue</button>
      <div className="team-info">
        <h2>TEAM NAME: Null Pointers</h2>
        <h3>Ashwathh Saravanan</h3>
        <h3>Gowtham Kumar TV</h3>
        <h3>Prithvi S</h3>
      </div>
    </>
  )
}

