import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getRoleRedirectPath } from "../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.twoFactorRequired) {
        localStorage.setItem("loginEmail", email.trim().toLowerCase());
        navigate("/login-verify");
      } else {
        const userData = response.data.user || {
          email: email.trim().toLowerCase(),
          role: email.includes("admin") ? "ADMIN" : email.includes("teacher") ? "TEACHER" : "STUDENT",
          firstName: email.split("@")[0],
          lastName: "User"
        };
        login(userData);
        navigate(getRoleRedirectPath(userData.role));
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Backend offline at localhost:5000. You can explore as demo user below."
          : "Login failed. Please verify your credentials.");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoUser = {
      id: `u-${role.toLowerCase()}-1`,
      firstName: role === "ADMIN" ? "Platform" : role === "TEACHER" ? "Sarah" : "Alex",
      lastName: role === "ADMIN" ? "Administrator" : role === "TEACHER" ? "Jenkins" : "Mercer",
      email: role === "ADMIN" ? "admin@mathmastry.com" : role === "TEACHER" ? "teacher@mathmastry.com" : "student@example.com",
      role: role,
      emailVerified: true
    };
    login(demoUser);
    navigate(getRoleRedirectPath(role));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>MathMastry</h1>
        <h2>Login</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={fieldErrors.email ? "input-error" : ""}
              disabled={loading}
              required
            />
            {fieldErrors.email && (
              <span className="field-error-text">{fieldErrors.email}</span>
            )}
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={fieldErrors.password ? "input-error" : ""}
              disabled={loading}
              required
            />
            {fieldErrors.password && (
              <span className="field-error-text">{fieldErrors.password}</span>
            )}
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", fontWeight: 600 }}>
            QUICK DEMO ACCESS (ONE-CLICK)
          </p>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => handleDemoLogin("STUDENT")}
              style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer" }}
            >
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("TEACHER")}
              style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer" }}
            >
              Teacher Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer" }}
            >
              Admin Demo
            </button>
          </div>
        </div>

        <p className="forgot-password-link" style={{ marginTop: "16px" }}>
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <p className="register-text">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;