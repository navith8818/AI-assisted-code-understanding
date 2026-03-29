import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged";
import "./Register.css";
import topBg from "../assets/login-top-bg.png";




export default function Register() {
  const [form, setForm]     = useState({ username: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      navigate("/login");                    // go to login after registering
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    
    <div className="register-page">  
       <div className="top-section">
        <img className="top-bg-image" src={topBg} alt="" aria-hidden="true" />
           <HeaderNotLogged/>    
        <div className="hero">
          <h1>Register</h1>
          <p className="hero-subtitle"><Link to="/Home">Home</Link> &gt; Register</p>
          {error && <p className="register-form-error">{error}</p>}

        </div>
      </div>
      
      <div className="register-form-card">
       
        <form onSubmit={handleSubmit}>
          <input className="register-form-input" placeholder="Username*"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})} />
          <input className="register-form-input" placeholder="Email*" type="email*"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <input className="register-form-input" placeholder="Password*" type="password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} />
          <button className="register-form-button" type="submit">Register</button>
        </form>
        <p className="register-form-link"><Link to="/login">Already have an account?</Link></p>
      </div>
    </div>
  );
}