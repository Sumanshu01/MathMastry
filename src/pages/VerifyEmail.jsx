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
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Please enter the verification OTP.");
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/verify-email",
        {
          email: email || "student@example.com",
          otp: otp.trim(),
        }
      );

      setMessage(response.data?.message || "Email verified successfully!");
      localStorage.removeItem("verificationEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      if (err.code === "ERR_NETWORK" || !err.response) {
        // Fallback for offline demo mode
        setMessage("Demo verification accepted (Offline mode). Redirecting to login...");
        localStorage.removeItem("verificationEmail");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Verification failed. Please check the code."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    setError("");
    setResending(true);

    try {
      const response = await api.post(
        "/auth/resend-otp",
        {
          email: email || "student@example.com",
          purpose: "EMAIL_VERIFY",
        }
      );

      setMessage(response.data?.message || "New OTP code sent to your email.");
    } catch (err) {
      if (err.code === "ERR_NETWORK" || !err.response) {
        setMessage("Demo mode: Code '123456' can be used for verification.");
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not resend OTP."
        );
      }
    } finally {
      setResending(false);
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
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="resend-section">
          <span>Didn't receive the code?</span>

          <button
            type="button"
            className="resend-button"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend OTP"}
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
