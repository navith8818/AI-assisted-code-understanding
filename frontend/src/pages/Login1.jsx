import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import "./Login1.css";
import topBg from "../assets/login-top-bg.png";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged";
import Footer from "../components/Shared/Footer.jsx";

export default function Login1() {
  const [form, setForm] = useState({username: "", password: "",});
  const [error, setError] = useState("");
  const navigate          = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token); // save JWT
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };  


  return (
    <div className="page">
      <HeaderNotLogged />
      <div className="top-section">
        <img className="top-bg-image" src={topBg} alt="" aria-hidden="true" />
        
        {/* HERO TITLE */}
        <div className="hero">
          <h1>Log In</h1>
          <p className="hero-subtitle"><Link to="/Home">Home</Link> &gt; Log In</p>
          {error && <p className="hero-error">{error}</p>}
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Username*"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            className="input"
            type="password"
            placeholder="Password*"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <div className="forgot">Forgot password?</div>

          <button className="continue-btn">Continue</button>

          <div className="divider">or</div>

          <button className="google-btn" type="button">
            <span className="google-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.233 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.715 36 24 36c-5.212 0-9.619-3.329-11.283-7.946l-6.522 5.025C9.5 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.112-2.15 3.877-4.084 5.071l.003-.002 6.19 5.238C36.971 38.688 44 33 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
            </span>
            <span>Login with Google</span>
          </button>

          <p className="register"><Link to="/register">I don't have an account</Link></p>
        </form>
      </div>
      <Footer/>
    </div>
  );
}