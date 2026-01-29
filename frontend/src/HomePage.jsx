import './homepage.css'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

export function HomePage() {
  const navigate = useNavigate()
  const [selectedCrop, setSelectedCrop] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  
  // Ref to close dropdown when clicking outside
  const dropdownRef = useRef(null)

  const crops = ["Coffee", "Cotton", "Maize", "Rice", "Sugarcane", "Tea", "Wheat"]

  const goToResults = () => {
    if (!selectedCrop) {
      alert("Please select a crop");
      return;
    }
    navigate("/results", { state: { selectedCrop: selectedCrop } });
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="main-container">
      {/* Background Blobs for Glow Effect */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="glass-card">
        <div className="header">
          <h1 className="title">Crop Sense</h1>
          <p className="subtitle">Smart Greenhouse Climate Analytics</p>
        </div>

        <div className="control-group">
          <label className="input-label">Select your crop</label>
          
          {/* --- CUSTOM DROPDOWN --- */}
          <div className="custom-dropdown" ref={dropdownRef}>
            <div 
              className={`dropdown-header ${isOpen ? 'open' : ''}`} 
              onClick={() => setIsOpen(!isOpen)}
            >
              {selectedCrop ? selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1) : "Choose an option..."}
              <span className="arrow">▼</span>
            </div>
            
            {isOpen && (
              <ul className="dropdown-list">
                {crops.map((crop) => (
                  <li 
                    key={crop} 
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCrop(crop.toLowerCase());
                      setIsOpen(false);
                    }}
                  >
                    {crop}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* ----------------------- */}
        </div>

        <button className="retrieve-button" role="button" onClick={goToResults}>
          Analyze Data
        </button>
      </div>
    </div>
  )
}