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
          Crop Sense
        </h1>

      </div>
      <div className="problem-statement">
        <p>
          Smart Greenhouse Climate Analytics
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
    </>
  )
}

