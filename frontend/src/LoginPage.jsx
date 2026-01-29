import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./loginpage.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/homepage");
    } catch (err) {
      setError("Invalid email or password");
      console.log(err);
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="auth-container">
      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="glass-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to monitor your crops</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="primary-btn">
            Login
          </button>
        </form>

        <div className="switch-auth">
          <p>Don't have an account?</p>
          <button onClick={goToSignup} className="text-btn">
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  );
}