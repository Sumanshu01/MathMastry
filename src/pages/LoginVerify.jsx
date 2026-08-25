import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./VerifyEmail.css";

function LoginVerify() {
  const navigate = useNavigate();

  const email = localStorage.getItem("loginEmail");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      await api.post("/auth/login/verify", {
        email,
        otp,
      });

      localStorage.removeItem("loginEmail");

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "OTP verification failed."
      );
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/resend-otp", {
        email,
        purpose: "LOGIN_2FA",
      });

      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not resend OTP."
      );
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <h1>MathMastry</h1>
        <h2>Two-Factor Verification</h2>

        <p className="verify-description">
          Enter the OTP sent to your email.
        </p>

        <form onSubmit={handleVerify}>
          <div className="verify-form-group">
            <label>OTP</label>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            className="verify-button"
            type="submit"
          >
            Verify & Login
          </button>
        </form>

        <div className="resend-section">
          <span>Didn't receive the code?</span>

          <button
            type="button"
            className="resend-button"
            onClick={handleResend}
          >
            Resend OTP
          </button>
        </div>

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

export default LoginVerify;
