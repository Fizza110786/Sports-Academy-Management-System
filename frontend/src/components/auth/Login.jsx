import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiMoon, FiSun } from "react-icons/fi";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // ✅ FIX: check role BEFORE saving to localStorage
      if (res.data.user.role !== role) {
        setError(`You are not registered as ${role}`);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (role === "admin") navigate("/admin/dashboard");
      if (role === "coach") navigate("/coach/dashboard");
      if (role === "student") navigate("/student/dashboard");

    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className={`auth-container ${darkMode ? "dark" : ""}`}>

      <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FiSun /> : <FiMoon />}
      </div>

      <div className="auth-left">
        <div className="brand">
          <div className="logo">🏆</div>
          <h2>SportAcademy</h2>
        </div>

        <h1>
          Empowering Athletes,<br />
          <span>Building Champions</span>
        </h1>

        <p>
          A comprehensive management system for sports academies.
          Train smarter, manage better, achieve more.
        </p>

        <div className="stats">
          <div className="stat-box">
            <h3>500+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-box">
            <h3>50+</h3>
            <p>Expert Coaches</p>
          </div>
          <div className="stat-box">
            <h3>15+</h3>
            <p>Sports Programs</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <h2 className="welcome-title">Welcome Back</h2>
        <p className="welcome-subtitle">
          Choose your role and continue to your dashboard
        </p>

        <div className="role-select">
          <div
            className={`role-card admin ${role === "admin" ? "active-role" : ""}`}
            onClick={() => setRole("admin")}
          >
            <h4>Administrator</h4>
            <p>Full system access and management</p>
          </div>

          <div
            className={`role-card coach ${role === "coach" ? "active-role" : ""}`}
            onClick={() => setRole("coach")}
          >
            <h4>Coach</h4>
            <p>Manage training and student progress</p>
          </div>

          <div
            className={`role-card student ${role === "student" ? "active-role" : ""}`}
            onClick={() => setRole("student")}
          >
            <h4>Student</h4>
            <p>View schedules and track progress</p>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button type="submit" className="submit-btn">
            Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>
      </div>
    </div>
  );
}