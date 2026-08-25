import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateCurrentUserProfile } from "../services/authService";
import Badge from "../components/common/Badge";
import "../pages/Profile.css";

function TeacherProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "Sarah",
    lastName: user?.lastName || "Jenkins",
    email: user?.email || "teacher@mathmastry.com",
    phone: user?.phone || "+1 (555) 832-1109",
    qualification: "Ph.D. in Pure Mathematics, Cambridge University",
    specialization: "Number Theory, Formal Proofs & Olympiad Mathematics",
    bio: "Senior Lecturer in Mathematics with 12+ years of experience training Olympiad medalists and university scholars."
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaveLoading(true);

    try {
      const updated = await updateCurrentUserProfile(formData);
      updateUser(updated);
      setIsEditing(false);
      setMessage("Teacher profile updated successfully!");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const initials = formData.firstName
    ? `${formData.firstName.charAt(0)}${formData.lastName ? formData.lastName.charAt(0) : ""}`.toUpperCase()
    : "TJ";

  return (
    <div className="profile-page-view">
      {message && <div className="profile-toast success">✅ {message}</div>}
      {error && <div className="profile-toast error">⚠️ {error}</div>}

      <div className="profile-layout-grid">
        <div className="profile-card profile-summary-card">
          <div className="profile-avatar-large" style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
            {initials}
          </div>
          <h2>Dr. {formData.firstName} {formData.lastName}</h2>
          <p className="profile-email-text">{formData.email}</p>
          <div style={{ marginTop: "8px" }}>
            <Badge variant="green">TEACHER & FACULTY</Badge>
          </div>

          <div className="summary-stats-box">
            <div className="summary-stat">
              <span>Academic Dept</span>
              <strong>Mathematics</strong>
            </div>
            <div className="summary-stat">
              <span>Faculty Status</span>
              <strong style={{ color: "#16a34a" }}>Active Senior Lecturer</strong>
            </div>
            <div className="summary-stat">
              <span>Office Rating</span>
              <strong style={{ color: "#0d9488" }}>4.95 / 5.0 ⭐</strong>
            </div>
          </div>
        </div>

        <div className="profile-card profile-details-card">
          <div className="profile-card-header">
            <div>
              <h3>Faculty Profile & Qualifications</h3>
              <p>Manage your academic credentials and contact information.</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Details
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="profile-info-grid">
              <div className="info-field">
                <label>First Name</label>
                <p>{formData.firstName}</p>
              </div>

              <div className="info-field">
                <label>Last Name</label>
                <p>{formData.lastName}</p>
              </div>

              <div className="info-field">
                <label>Email</label>
                <p>{formData.email} <span className="read-only-pill">Faculty ID</span></p>
              </div>

              <div className="info-field">
                <label>Contact Phone</label>
                <p>{formData.phone}</p>
              </div>

              <div className="info-field full-width">
                <label>Academic Qualification</label>
                <p>{formData.qualification}</p>
              </div>

              <div className="info-field full-width">
                <label>Research & Teaching Specializations</label>
                <p>{formData.specialization}</p>
              </div>

              <div className="info-field full-width">
                <label>Biography</label>
                <p>{formData.bio}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-fields-grid">
                <div className="form-field-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group">
                  <label>Academic Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group full-width">
                  <label>Specializations</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group full-width">
                  <label>Faculty Bio</label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  style={{ background: "#0d9488" }}
                  disabled={saveLoading}
                >
                  {saveLoading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherProfile;
