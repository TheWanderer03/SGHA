import { Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './HomePage.jsx'
import { Results } from './Results.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </>
  )
}

export default App
