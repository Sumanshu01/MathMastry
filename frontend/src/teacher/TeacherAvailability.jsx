import { useState, useEffect } from "react";
import { getTeacherAvailability, updateTeacherAvailability } from "../services/teacherService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import "./Teacher.css";

function TeacherAvailability() {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTeacherAvailability();
      setAvailability(data);
    } catch (err) {
      console.error("Failed to load availability:", err);
      setError("Unable to load availability schedule. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleSlotToggle = (index) => {
    const updatedSlots = [...availability.slots];
    updatedSlots[index].enabled = !updatedSlots[index].enabled;
    setAvailability({ ...availability, slots: updatedSlots });
  };

  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...availability.slots];
    updatedSlots[index][field] = value;
    setAvailability({ ...availability, slots: updatedSlots });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateTeacherAvailability(availability);
      showToast("Weekly teaching availability updated successfully!", "success");
    } catch (err) {
      showToast("Failed to save availability: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teacher-page-view">
      <div className="courses-header-card">
        <div className="courses-header-text">
          <h1>Weekly Teaching Availability & Office Hours</h1>
          <p>
            Configure your teaching hours, problem clinic times, and student capacity per slot.
          </p>
        </div>
      </div>

      {error && (
        <div className="courses-error-banner">
          <span>⚠️ {error}</span>
          <button type="button" onClick={loadAvailability} className="courses-retry-btn">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading availability schedule..." />
      ) : !availability ? (
        <div className="teacher-card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#64748b" }}>Unable to display schedule.</p>
          <button type="button" onClick={loadAvailability} className="courses-retry-btn" style={{ marginTop: "12px" }}>
            Reload Schedule
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="teacher-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3>Weekly Schedule Slots</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                Active slots determine when students can book problem clinics and 1-on-1 reviews.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>Max Weekly Hours:</span>
              <input
                type="number"
                value={availability.weeklyHoursLimit}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    weeklyHoursLimit: Number(e.target.value)
                  })
                }
                style={{ width: "70px", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              />
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
            {availability.slots.map((slot, index) => (
              <div className="availability-day-row" key={slot.day}>
                <div className="day-label-box">
                  <input
                    type="checkbox"
                    className="day-toggle-input"
                    checked={slot.enabled}
                    onChange={() => handleSlotToggle(index)}
                    id={`day-${slot.day}`}
                  />
                  <label htmlFor={`day-${slot.day}`} style={{ fontWeight: 600, color: slot.enabled ? "#1e293b" : "#94a3b8", cursor: "pointer" }}>
                    {slot.day}
                  </label>
                </div>

                <div className="time-range-inputs">
                  <input
                    type="time"
                    value={slot.startTime}
                    disabled={!slot.enabled}
                    onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
                  />
                  <span style={{ color: "#94a3b8" }}>to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    disabled={!slot.enabled}
                    onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Max Students:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    disabled={!slot.enabled}
                    value={slot.maxStudentsPerSlot}
                    onChange={(e) => handleTimeChange(index, "maxStudentsPerSlot", Number(e.target.value))}
                    style={{ width: "55px", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Office Hours / Meeting Link Announcement
            </label>
            <textarea
              rows="3"
              value={availability.officeHoursNotice}
              onChange={(e) => setAvailability({ ...availability, officeHoursNotice: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="enroll-action-btn"
              style={{ background: "#0d9488", padding: "11px 24px" }}
              disabled={saving}
            >
              {saving ? "Saving Schedule..." : "Save Availability Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TeacherAvailability;
