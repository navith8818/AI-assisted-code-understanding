import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm]     = useState({ username: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      navigate("/login");           // go to login after registering
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})} />
          <input style={styles.input} placeholder="Email" type="email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <input style={styles.input} placeholder="Password" type="password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} />
          <button style={styles.button} type="submit">Register</button>
        </form>
        <p style={styles.link}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:"flex", justifyContent:"center",
               alignItems:"center", height:"100vh", background:"#f0f2f5" },
  card:      { background:"white", padding:"2rem", borderRadius:"8px",
               width:"360px", boxShadow:"0 2px 10px rgba(0,0,0,0.1)" },
  title:     { marginBottom:"1.5rem", textAlign:"center" },
  input:     { display:"block", width:"100%", padding:"0.6rem",
               marginBottom:"1rem", borderRadius:"4px",
               border:"1px solid #ccc", boxSizing:"border-box" },
  button:    { width:"100%", padding:"0.7rem", background:"#4f46e5",
               color:"white", border:"none", borderRadius:"4px",
               cursor:"pointer", fontSize:"1rem" },
  error:     { color:"red", marginBottom:"1rem" },
  link:      { textAlign:"center", marginTop:"1rem" },
};