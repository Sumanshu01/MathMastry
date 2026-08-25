import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateCurrentUserProfile } from "../services/authService";
import { getMyEnrollments } from "../services/enrollmentService";
import Badge from "../components/common/Badge";
import "./Profile.css";

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [myEnrollments, setMyEnrollments] = useState([]);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "Alex",
    lastName: user?.lastName || "Mercer",
    email: user?.email || "student@example.com",
    phone: user?.phone || "+1 (555) 349-8821",
    gradeLevel: "Grade 11 - Advanced Mathematics Track",
    bio: "Passionate about pure mathematics, proof algorithms, and participating in Olympiad competitions."
  });

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const list = await getMyEnrollments();
        setMyEnrollments(list);
      } catch (_err) {
        // ignore
      }
    }
    loadEnrollments();
  }, []);

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
      const updated = await updateCurrentUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        gradeLevel: formData.gradeLevel
      });

      updateUser(updated);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const initials = formData.firstName
    ? `${formData.firstName.charAt(0)}${formData.lastName ? formData.lastName.charAt(0) : ""}`.toUpperCase()
    : "MM";

  return (
    <div className="profile-page-view">
      {message && <div className="profile-toast success">✅ {message}</div>}
      {error && <div className="profile-toast error">⚠️ {error}</div>}

      <div className="profile-layout-grid">
        {/* Left Card: Summary Avatar */}
        <div className="profile-card profile-summary-card">
          <div className="profile-avatar-large">{initials}</div>
          <h2>
            {formData.firstName} {formData.lastName}
          </h2>
          <p className="profile-email-text">{formData.email}</p>
          <div style={{ marginTop: "8px" }}>
            <Badge variant="blue">{user?.role || "STUDENT"}</Badge>
          </div>

          <div className="summary-stats-box">
            <div className="summary-stat">
              <span>Courses Enrolled</span>
              <strong>{myEnrollments.length}</strong>
            </div>
            <div className="summary-stat">
              <span>Verification</span>
              <strong style={{ color: "#16a34a" }}>Verified ✓</strong>
            </div>
            <div className="summary-stat">
              <span>Account Status</span>
              <strong style={{ color: "#2563eb" }}>Active</strong>
            </div>
          </div>
        </div>

        {/* Right Card: Details & Edit Form */}
        <div className="profile-card profile-details-card">
          <div className="profile-card-header">
            <div>
              <h3>Personal Information</h3>
              <p>Manage your account settings and contact details.</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
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
                <label>Email Address</label>
                <p>{formData.email} <span className="read-only-pill">Read-only</span></p>
              </div>

              <div className="info-field">
                <label>Phone Number</label>
                <p>{formData.phone || "Not set"}</p>
              </div>

              <div className="info-field full-width">
                <label>Academic Track</label>
                <p>{formData.gradeLevel}</p>
              </div>

              <div className="info-field full-width">
                <label>Bio & Mathematical Interests</label>
                <p>{formData.bio}</p>
              </div>

              <div className="info-field full-width">
                <label>Active Subject Enrolments</label>
                <div className="enrolled-pills-wrap">
                  {myEnrollments.map((enr) => (
                    <span className="enrolled-sub-pill" key={enr.id}>
                      📖 {enr.courseTitle} ({enr.progress}%)
                    </span>
                  ))}
                </div>
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
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
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

                <div className="form-field-group full-width">
                  <label>Academic Track</label>
                  <input
                    type="text"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group full-width">
                  <label>Bio</label>
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
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saveLoading}
                >
                  {saveLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
