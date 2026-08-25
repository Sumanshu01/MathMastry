import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./VerifyEmail.css";

function VerifyEmail() {
  const navigate = useNavigate();

  const email = localStorage.getItem(
    "verificationEmail"
  );

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.post(
        "/auth/verify-email",
        {
          email,
          otp,
        }
      );

      setMessage(response.data.message);

      localStorage.removeItem(
        "verificationEmail"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Verification failed."
      );
    }
  };

  const handleResend = async () => {
    setMessage("");
    setError("");

    try {
      const response = await api.post(
        "/auth/resend-otp",
        {
          email,
          purpose: "EMAIL_VERIFY",
        }
      );

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
        <h2>Verify Email</h2>

        <p className="verify-description">
          Enter the OTP sent to your email.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="verify-form-group">
            <label>OTP</label>

            <input
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              required
            />
          </div>

          <button
            className="verify-button"
            type="submit"
          >
            Verify Email
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

export default VerifyEmail;
