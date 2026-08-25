import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments } from "../services/enrollmentService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import "./Progress.css";

function Progress() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getMyEnrollments();
        setEnrollments(list);
      } catch (err) {
        console.error("Error loading progress data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCourses = enrollments.length;
  const completedLessons = enrollments.reduce((acc, curr) => acc + (curr.completedLessons || 0), 0);
  const totalLessons = enrollments.reduce((acc, curr) => acc + (curr.totalLessons || 0), 0);
  const overallAvg = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const certificatesEarned = enrollments.filter((e) => e.progress >= 75).length;

  return (
    <div className="progress-page-view">
      {/* Overview Cards */}
      <section className="progress-metrics-row">
        <div className="progress-metric-card">
          <div className="metric-icon-circle blue">📈</div>
          <div>
            <p>Overall Completion Rate</p>
            <h2>{overallAvg}%</h2>
          </div>
        </div>

        <div className="progress-metric-card">
          <div className="metric-icon-circle green">✅</div>
          <div>
            <p>Lessons Completed</p>
            <h2>{completedLessons} <span style={{ fontSize: "14px", color: "#6b7280" }}>/ {totalLessons}</span></h2>
          </div>
        </div>

        <div className="progress-metric-card">
          <div className="metric-icon-circle purple">🏆</div>
          <div>
            <p>Mastery Certifications</p>
            <h2>{certificatesEarned}</h2>
          </div>
        </div>

        <div className="progress-metric-card">
          <div className="metric-icon-circle yellow">🎓</div>
          <div>
            <p>Active Course Tracks</p>
            <h2>{totalCourses}</h2>
          </div>
        </div>
      </section>

      {/* Main Course Progress Detailed Breakdown */}
      <section className="progress-details-card">
        <div className="card-header-bar">
          <div>
            <h2>Course Progress & Mastery Breakdown</h2>
            <p>Detailed performance benchmarks and milestone completion across enrolled subjects.</p>
          </div>
          <Link to="/courses" className="add-subject-btn">+ Add Another Subject</Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Computing performance metrics..." />
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No Active Enrollments"
            description="You don't have any enrolled courses to track progress for."
            action={
              <Link to="/courses" className="add-subject-btn">
                Browse Courses
              </Link>
            }
          />
        ) : (
          <div className="progress-items-list">
            {enrollments.map((enr) => (
              <div className="progress-track-item" key={enr.id}>
                <div className="track-item-main">
                  <div className="track-left">
                    <div className="course-badge-avatar">
                      {enr.courseTitle ? enr.courseTitle.charAt(0) : "M"}
                    </div>
                    <div>
                      <h3>{enr.courseTitle}</h3>
                      <p className="track-meta">
                        Instructor: <strong>{enr.teacherName}</strong> • Enrolled: {enr.enrolledAt}
                      </p>
                    </div>
                  </div>

                  <div className="track-right">
                    <Badge variant={enr.progress >= 75 ? "green" : enr.progress >= 50 ? "blue" : "yellow"}>
                      {enr.status || "ACTIVE"}
                    </Badge>
                    <span className="track-grade-pill">{enr.grade || "In Progress"}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="track-bar-container">
                  <div className="track-bar-info">
                    <span>
                      {enr.completedLessons} of {enr.totalLessons} lessons mastered
                    </span>
                    <strong>{enr.progress}% Complete</strong>
                  </div>
                  <div className="custom-progress-track">
                    <div
                      className="custom-progress-fill"
                      style={{
                        width: `${enr.progress}%`,
                        background: enr.progress >= 75 ? "#10b981" : enr.progress >= 50 ? "#2563eb" : "#f59e0b"
                      }}
                    />
                  </div>
                </div>

                {/* Milestone Chips */}
                <div className="milestones-row">
                  <span className={`milestone-chip ${enr.progress >= 25 ? "achieved" : ""}`}>
                    ✓ Fundamentals
                  </span>
                  <span className={`milestone-chip ${enr.progress >= 50 ? "achieved" : ""}`}>
                    ✓ Midterm Exam
                  </span>
                  <span className={`milestone-chip ${enr.progress >= 75 ? "achieved" : ""}`}>
                    ✓ Advanced Problems
                  </span>
                  <span className={`milestone-chip ${enr.progress === 100 ? "achieved" : ""}`}>
                    ✓ Final Master Certificate
                  </span>

                  {enr.progress >= 75 && (
                    <button
                      type="button"
                      className="view-certificate-btn"
                      onClick={() => setSelectedCert(enr)}
                    >
                      🏆 View Certificate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certificate Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title="MathMastry Certificate of Achievement"
          footer={
            <button
              type="button"
              className="add-subject-btn"
              onClick={() => {
                window.print();
              }}
            >
              🖨️ Print / Save PDF
            </button>
          }
        >
          <div className="certificate-frame">
            <div className="cert-badge-gold">∑</div>
            <h2>CERTIFICATE OF EXCELLENCE</h2>
            <p className="cert-subtitle">This is proudly presented to</p>
            <h1 className="cert-student-name">{selectedCert.studentName || "Alex Mercer"}</h1>
            <p className="cert-body">
              for successfully mastering the advanced curriculum and demonstrating exceptional problem-solving proficiency in
            </p>
            <h3 className="cert-course-name">{selectedCert.courseTitle}</h3>
            <div className="cert-footer-meta">
              <div>
                <p>Instructor</p>
                <strong>{selectedCert.teacherName}</strong>
              </div>
              <div>
                <p>Final Standing</p>
                <strong>{selectedCert.grade || "Distinction (92%)"}</strong>
              </div>
              <div>
                <p>Issued Date</p>
                <strong>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Progress;