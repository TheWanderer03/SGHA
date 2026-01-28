import { Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './HomePage.jsx'
import { Results } from './Results.jsx'
<<<<<<< HEAD
import { LoginPage } from './LoginPage.jsx'
=======
import { Login } from './LoginPage.jsx';
>>>>>>> 9e402c5b108165c5ccd9b09a54ac8d14a07195a3

function App() {

  return (
    <>
      <Routes>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/results" element={<Results />} />
<<<<<<< HEAD
        <Route path="/" element={<LoginPage />} />
=======
        <Route path="/" element={<Login />} />
>>>>>>> 9e402c5b108165c5ccd9b09a54ac8d14a07195a3
      </Routes>
    </>
  )
}

export default App
