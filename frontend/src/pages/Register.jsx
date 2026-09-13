import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getRoleRedirectPath } from "../services/authService";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required.";
        if (value.trim().length < 2) return "First name must be at least 2 characters.";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required.";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Please enter a valid email address (e.g. name@domain.com).";
        }
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required.";
        if (!/^[0-9+()\s-]{7,20}$/.test(value.trim())) {
          return "Please enter a valid contact phone number.";
        }
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters long.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: err,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: err,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload = {
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role || "STUDENT",
    };

    try {
      const response = await api.post("/auth/register", payload);
      const { user } = response.data;

      // Auto-login: store user in auth context + localStorage
      login(user);

      // Redirect to role-appropriate dashboard immediately
      navigate(getRoleRedirectPath(user.role), { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        setErrors(data.errors);
      }
      setServerError(
        data?.error ||
        data?.message ||
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>MathMastry</h1>
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-first-name">First Name *</label>
            <input
              id="reg-first-name"
              type="text"
              name="firstName"
              placeholder="e.g. Alex"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.firstName ? "input-error" : ""}
              disabled={loading}
              required
            />
            {errors.firstName && (
              <span className="field-error-text">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-last-name">Last Name *</label>
            <input
              id="reg-last-name"
              type="text"
              name="lastName"
              placeholder="e.g. Mercer"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.lastName ? "input-error" : ""}
              disabled={loading}
              required
            />
            {errors.lastName && (
              <span className="field-error-text">{errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="e.g. alex@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? "input-error" : ""}
              disabled={loading}
              required
            />
            {errors.email && (
              <span className="field-error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Contact Phone *</label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              placeholder="e.g. +1 (555) 349-8821"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.phone ? "input-error" : ""}
              disabled={loading}
              required
            />
            {errors.phone && (
              <span className="field-error-text">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.password ? "input-error" : ""}
              disabled={loading}
              required
            />
            {errors.password ? (
              <span className="field-error-text">{errors.password}</span>
            ) : (
              <span className="field-hint-text">Minimum 6 characters</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Account Role</label>
            <select
              id="reg-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher / Faculty</option>
            </select>
          </div>

          <button
            className="register-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {serverError && (
          <p className="error-message">{serverError}</p>
        )}

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

