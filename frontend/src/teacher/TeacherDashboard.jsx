import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTeacherCourses, getTeacherAvailability } from "../services/teacherService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "./Teacher.css";

function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [courseList, avail] = await Promise.all([
        getTeacherCourses(),
        getTeacherAvailability()
      ]);
      setCourses(courseList);
      setAvailability(avail);
    } catch (err) {
      console.error("Error loading teacher dashboard:", err);
      setError("Unable to load assigned courses and schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAssignedCourses = courses.length;
  const totalStudents = courses.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
  const weeklyHours = availability?.weeklyHoursLimit || 25;

  const todaySessions = [
    {
      id: "s1",
      title: "Pure Mathematics: Group Theory & Proofs",
      time: "4:00 PM - 5:30 PM",
      studentsCount: 18,
      room: "Interactive Lab Alpha"
    },
    {
      id: "s2",
      title: "Olympiad Math: Pigeonhole & Combinatorics",
      time: "6:00 PM - 7:30 PM",
      studentsCount: 12,
      room: "Seminar Room 2"
    }
  ];

  return (
    <div className="teacher-page-view">
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#991b1b" }}>
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={loadData}
            style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Banner */}
      <div className="teacher-hero-banner">
        <div>
          <h1>Welcome, {user?.firstName || "Teacher"}! 👨‍🏫</h1>
          <p>
            You are managing <strong>{totalAssignedCourses} active courses</strong> with <strong>{totalStudents} enrolled students</strong> this term.
          </p>
        </div>
        <button
          type="button"
          className="teacher-action-btn-light"
          onClick={() => navigate("/teacher/courses")}
        >
          View Class Rosters →
        </button>
      </div>

      {/* Metric Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper green">📖</div>
          <div className="stat-details">
            <p>Courses Taught</p>
            <h2>{totalAssignedCourses}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">👥</div>
          <div className="stat-details">
            <p>Total Enrolled Students</p>
            <h2>{totalStudents}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">⏱️</div>
          <div className="stat-details">
            <p>Weekly Teaching Load</p>
            <h2>{weeklyHours} hrs</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">⭐</div>
          <div className="stat-details">
            <p>Teacher Rating</p>
            <h2>4.95 / 5.0</h2>
          </div>
        </div>
      </section>

      {/* Today's Schedule & Quick Actions */}
      <div className="schedule-section-grid">
        <div className="teacher-card">
          <h3>🗓️ Today's Teaching Sessions</h3>
          {loading ? (
            <LoadingSpinner text="Fetching schedule..." />
          ) : (
            <div className="classes-timeline">
              {todaySessions.map((session) => (
                <div className="class-slot-item" key={session.id}>
                  <div className="class-slot-time">
                    <span>{session.time.split(" - ")[0]}</span>
                    <span>to {session.time.split(" - ")[1]}</span>
                  </div>

                  <div className="class-slot-info">
                    <h4>{session.title}</h4>
                    <p>👥 {session.studentsCount} Students Registered • 📍 {session.room}</p>
                  </div>

                  <div className="class-slot-actions">
                    <button
                      type="button"
                      className="roster-btn"
                      onClick={() => navigate("/teacher/courses")}
                    >
                      Roster
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools */}
        <div className="teacher-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3>⚡ Quick Actions</h3>
          <button
            type="button"
            className="continue-button"
            style={{ background: "#0d9488" }}
            onClick={() => navigate("/teacher/courses")}
          >
            📋 Manage Course Rosters
          </button>
          <button
            type="button"
            className="continue-button"
            style={{ background: "#0284c7" }}
            onClick={() => navigate("/teacher/availability")}
          >
            ⏱️ Update Availability Slots
          </button>
          <button
            type="button"
            className="continue-button"
            style={{ background: "#4f46e5" }}
            onClick={() => navigate("/teacher/profile")}
          >
            👤 Edit Faculty Profile
          </button>

          <div style={{ marginTop: "auto", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: 700, color: "#475569" }}>
              💡 Faculty Announcement
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Midterm assessments must be submitted through the roster console before Friday 5:00 PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
