import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";


export default function Login() {
  const [form, setForm]   = useState({ username: "", password: "" });
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})} />
          <input style={styles.input} placeholder="Password" type="password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} />
          <button style={styles.button} type="submit">Login</button>
        </form>
        <p style={styles.link}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b0b0b",
    color: "#fff",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    padding: "24px",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 16px",
    textAlign: "center",
  },
  error: {
    color: "#ff8080",
    marginBottom: "12px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#111",
    color: "#fff",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#e34d00",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  link: {
    marginTop: "14px",
    textAlign: "center",
  },
};

