import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateCurrentUserProfile } from "../services/authService";
import { getMyEnrollments } from "../services/enrollmentService";
import { useToast } from "../context/ToastContext";
import Badge from "../components/common/Badge";
import "./Profile.css";

function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [myEnrollments, setMyEnrollments] = useState([]);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "Alex",
    lastName: user?.lastName || "Mercer",
    email: user?.email || "student@example.com",
    phone: user?.phone || "+1 (555) 349-8821",
    gradeLevel: user?.gradeLevel || "Grade 11 - Advanced Mathematics Track",
    bio: user?.bio || "Passionate about pure mathematics, proof algorithms, and participating in Olympiad competitions."
  });

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const list = await getMyEnrollments();
        setMyEnrollments(list);
      } catch {
        // Fallback handled inside enrollmentService
      }
    }
    loadEnrollments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }
    if (formData.phone && !/^[0-9+()\s-]{7,20}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSaveLoading(true);

    try {
      const updated = await updateCurrentUserProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        gradeLevel: formData.gradeLevel.trim()
      });

      updateUser(updated);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update profile.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const initials = formData.firstName
    ? `${formData.firstName.charAt(0)}${formData.lastName ? formData.lastName.charAt(0) : ""}`.toUpperCase()
    : "MM";

  return (
    <div className="profile-page-view">
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
            <form onSubmit={handleSave} className="profile-edit-form" noValidate>
              <div className="form-fields-grid">
                <div className="form-field-group">
                  <label htmlFor="prof-first-name">First Name *</label>
                  <input
                    id="prof-first-name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={fieldErrors.firstName ? "input-error" : ""}
                    required
                  />
                  {fieldErrors.firstName && (
                    <span className="field-error-text">{fieldErrors.firstName}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="prof-last-name">Last Name *</label>
                  <input
                    id="prof-last-name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={fieldErrors.lastName ? "input-error" : ""}
                    required
                  />
                  {fieldErrors.lastName && (
                    <span className="field-error-text">{fieldErrors.lastName}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="prof-email">Email Address</label>
                  <input
                    id="prof-email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="prof-phone">Phone Number</label>
                  <input
                    id="prof-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={fieldErrors.phone ? "input-error" : ""}
                  />
                  {fieldErrors.phone && (
                    <span className="field-error-text">{fieldErrors.phone}</span>
                  )}
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
