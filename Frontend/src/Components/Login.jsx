// src/Pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Utility/Api";
import "../Components/Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage({ text: "Login successful! Redirecting...", type: "success" });

      setTimeout(() => navigate("/dashboard"), 800);

      setForm({ email: "", password: "" });
    } catch (err) {
      console.error(err.response?.data);
      setMessage({
        text: err.response?.data?.error || "Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE - BANK BRANDING */}
      <div className="login-left">
        <div className="brand-content">
          <div className="logo-container">
            <div className="logo-icon">🏦</div>
            <h1>Siege Bank</h1>
          </div>
          <p className="tagline">Secure. Reliable. Trusted Banking Experience.</p>
          <div className="features">
            <p>256-bit Encryption</p>
            <p>Instant Transfers</p>
            <p>Real-Time Alerts</p>
            <p>24/7 Support</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="sub-text">Sign in to access your account</p>

          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Secure Login"
              )}
            </button>
          </form>

          <div className="links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}