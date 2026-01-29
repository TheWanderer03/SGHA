import { Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './HomePage.jsx'
import { Results } from './Results.jsx'
import { LoginPage } from './LoginPage.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { SignupPage } from "./SignupPage";

function App() {

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/results" element={<Results />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route path="/" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App
