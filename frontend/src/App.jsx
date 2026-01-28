import { Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './HomePage.jsx'
import { Results } from './Results.jsx'
import { LoginPage } from './LoginPage.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App
