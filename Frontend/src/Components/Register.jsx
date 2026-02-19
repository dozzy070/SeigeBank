
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Utility/Api";
import "../Components/Register.css";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    govId: "",
    taxNumber: "",
    passportId: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    contactDetails: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (message.text) setMessage({ text: "", type: "" });
  };

  // 🔐 Password Strength Logic
  const getPasswordStrength = () => {
    const { password } = form;

    if (password.length < 6) return "Weak";
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/))
      return "Strong";

    return "Medium";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const errors = {};
    if (!form.username) errors.username = "Username is required";
    if (!form.fullname) errors.fullname = "Full name is required";
    if (!form.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email";
    if (!form.password) errors.password = "Password is required";
    if (form.password && form.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setMessage({ text: "Please fix the highlighted fields", type: "error" });
      return;
    }
    setFieldErrors({});

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/register",
        {
          username: form.username,
          fullname: form.fullname,
          email: form.email,
          password: form.password,
          phone: form.phone,
          dob: form.dob,
          govId: form.govId,
          taxNumber: form.taxNumber,
          passportId: form.passportId,
          nextOfKinName: form.nextOfKinName,
          nextOfKinPhone: form.nextOfKinPhone,
          contactDetails: form.contactDetails,
        }
      );

      const acctNum = res.data?.account?.account_number;

      setMessage({
        text: `✅ Registration successful! ${acctNum ? `Account: ${acctNum}` : ''} Redirecting to login...`,
        type: "success",
      });

      setForm({
        username: "",
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dob: "",
        govId: "",
        taxNumber: "",
        passportId: "",
        nextOfKinName: "",
        nextOfKinPhone: "",
        contactDetails: "",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      // Map backend validation errors to fieldErrors if available
      if (Array.isArray(backendErrors) && backendErrors.length) {
        const map = {};
        backendErrors.forEach((e) => {
          if (e.param) map[e.param] = e.msg;
        });
        setFieldErrors(map);
        setMessage({ text: "Please fix the highlighted fields", type: "error" });
      } else {
        setMessage({
          text: err.response?.data?.error || "❌ Registration failed",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="login-container">
      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="brand-content">
          <div className="logo-container">
            <div className="logo-icon">🏦</div>
            <h1>Siege Bank</h1>
          </div>
          <p className="tagline">
            Open your secure digital banking account today.
          </p>

          <div className="features">
            <p>Free Account Setup</p>
            <p>Instant Activation</p>
            <p>Bank-Level Encryption</p>
            <p>24/7 Fraud Monitoring</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <h2>Create Account</h2>
          <p className="sub-text">Start your secure banking journey</p>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Full name as on ID"
                value={form.fullname}
                onChange={handleChange}
                required
              />
              {fieldErrors.fullname && <div className="field-error">{fieldErrors.fullname}</div>}
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. +2348012345678"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Government ID</label>
              <input
                type="text"
                name="govId"
                placeholder="National ID / Driver's License"
                value={form.govId}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Tax / BVN Number</label>
              <input
                type="text"
                name="taxNumber"
                placeholder="Tax ID / BVN"
                value={form.taxNumber}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Passport ID (optional)</label>
              <input
                type="text"
                name="passportId"
                placeholder="Passport Number"
                value={form.passportId}
                onChange={handleChange}
              />
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
            
            {/* Password Strength Indicator */}
            {form.password && (
              <div className={`strength ${strength.toLowerCase()}`}>
                Strength: {strength}
              </div>
            )}

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
            </div>

            <div className="input-group">
              <label>Next of Kin Name</label>
              <input
                type="text"
                name="nextOfKinName"
                placeholder="Next of kin full name"
                value={form.nextOfKinName}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Next of Kin Phone</label>
              <input
                type="tel"
                name="nextOfKinPhone"
                placeholder="Next of kin phone number"
                value={form.nextOfKinPhone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Contact Details</label>
              <textarea
                name="contactDetails"
                placeholder="Additional contact information or address"
                value={form.contactDetails}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Secure Account"}
            </button>
          </form>

          <div className="links">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
