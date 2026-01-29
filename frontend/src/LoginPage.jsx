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
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>

        {/* Sign Up section */}
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Don’t have an account?
        </p>

        <button
          type="button"
          className="signup-button"
          onClick={goToSignup}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
