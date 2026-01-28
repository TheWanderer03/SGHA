import { Link } from 'react-router-dom'
import './homepage.css'

const goToResults = () => {
  window.location.href = "/results";
}

export function HomePage() {
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
      <button className="retrieve-button" role="button" onClick={goToResults}>retrieve results</button>
      <div className="team-info">
        <h2>TEAM NAME: Null Pointers</h2>
        <h3>Ashwathh Saravanan</h3>
        <h3>Gowtham Kumar TV</h3>
        <h3>Prithvi S</h3>
      </div>
    </>
  )
}

