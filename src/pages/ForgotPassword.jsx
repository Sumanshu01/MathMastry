import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setMessage(response.data.message);

      localStorage.setItem(
        "resetEmail",
        email
      );

      setTimeout(() => {
        navigate("/reset-password");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Request failed."
      );
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1>MathMastry</h1>
        <h2>Forgot Password?</h2>

        <p className="forgot-description">
          Enter your email address and we'll send
          you a reset code.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button type="submit">
            Send Reset Code
          </button>
        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <p className="back-login">
          <Link to="/login">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;