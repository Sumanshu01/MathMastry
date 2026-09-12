import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments } from "../services/enrollmentService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
      setError("Unable to load active enrollment progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live stats from enrollments
  const totalCourses = enrollments.length;
  const completedLessons = enrollments.reduce((acc, curr) => acc + (curr.completedLessons || 0), 0);
  const totalLessons = enrollments.reduce((acc, curr) => acc + (curr.totalLessons || 0), 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const pendingTasks = enrollments.filter((e) => e.progress < 100).length;

  return (
    <div className="dashboard-view">
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

      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="banner-content">
          <h1>Welcome back, {user?.firstName || "Student"}! 📐</h1>
          <p>
            You are enrolled in <strong>{totalCourses}</strong> mathematics courses. Keep up the consistent practice to achieve mastery.
          </p>
        </div>
        <button
          type="button"
          className="browse-catalog-btn"
          onClick={() => navigate("/courses")}
        >
          Explore More Courses →
        </button>
      </div>

      {/* Live Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">📚</div>
          <div className="stat-details">
            <p>Active Courses</p>
            <h2>{totalCourses}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">✅</div>
          <div className="stat-details">
            <p>Completed Lessons</p>
            <h2>{completedLessons}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">📈</div>
          <div className="stat-details">
            <p>Overall Progress</p>
            <h2>{overallProgress}%</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">📝</div>
          <div className="stat-details">
            <p>Pending Milestones</p>
            <h2>{pendingTasks}</h2>
          </div>
        </div>
      </section>

      {/* Course Enrollment Section */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>My Enrolled Courses</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: "4px 0 0" }}>
              Continue where you left off in your active subjects
            </p>
          </div>

          <button
            className="view-all-button"
            type="button"
            onClick={() => navigate("/courses")}
          >
            View Catalog
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your courses & progress..." />
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No Courses Enrolled Yet"
            description="You have not enrolled in any math courses. Browse our course catalog to find the right math subject for you."
            action={
              <button
                type="button"
                className="continue-button"
                style={{ width: "auto", padding: "10px 24px" }}
                onClick={() => navigate("/courses")}
              >
                Browse Course Catalog
              </button>
            }
          />
        ) : (
          <div className="course-grid">
            {enrollments.map((enr) => (
              <div className="course-card" key={enr.id}>
                <div className="course-card-top">
                  <div className="course-icon">
                    {enr.courseTitle ? enr.courseTitle.charAt(0) : "M"}
                  </div>
                  <Badge variant={enr.progress >= 80 ? "green" : enr.progress >= 50 ? "blue" : "yellow"}>
                    {enr.category || "Mathematics"}
                  </Badge>
                </div>

                <h3>{enr.courseTitle}</h3>
                <p className="course-meta-text">
                  👨‍🏫 {enr.teacherName || "Math Faculty"} • ⏱️ {enr.lastAccessed || "Recent"}
                </p>

                <div className="progress-info-row">
                  <span>Lesson Progress</span>
                  <strong>{enr.completedLessons} / {enr.totalLessons} lessons</strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${enr.progress}%` }}
                  />
                </div>

                <div className="progress-footer-row">
                  <span>{enr.progress}% Complete</span>
                  <span className="course-grade-badge">{enr.grade || "In Progress"}</span>
                </div>

                <button
                  className="continue-button"
                  type="button"
                  onClick={() => navigate("/progress")}
                >
                  Continue Learning →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sibling & Scholarship Notice */}
      <div className="discount-cta-banner">
        <div className="discount-cta-info">
          <h3>👨‍👩‍👧‍👦 MathMastry Sibling Discount Program</h3>
          <p>
            Do you have siblings enrolled in MathMastry? You may be eligible for up to a 25% discount across all semester courses.
          </p>
        </div>
        <Link to="/courses" className="discount-cta-btn">
          View Details in Course Catalog
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
