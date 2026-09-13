import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const email = localStorage.getItem(
    "resetEmail"
  );

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      setMessage(response.data.message);

      localStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Password reset failed."
      );
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1>MathMastry</h1>
        <h2>Reset Password</h2>

        <p className="forgot-description">
          Enter the OTP from your email and choose
          a new password.
        </p>

        <form onSubmit={handleSubmit}>
          <label>OTP</label>

          <input
            type="text"
            placeholder="Enter reset code"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            required
          />

          <label>New Password</label>

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Reset Password
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

export default ResetPassword;