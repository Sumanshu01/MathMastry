import { useState, useEffect } from "react";
import { getTeacherCourses, getCourseRoster } from "../services/teacherService";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import "./Teacher.css";

function TeacherCourses() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Roster state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getTeacherCourses();
      setCourses(list);
    } catch (err) {
      console.error("Error loading assigned courses:", err);
      setError("Unable to load assigned courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRoster = async (course) => {
    setSelectedCourse(course);
    setIsRosterModalOpen(true);
    try {
      setRosterLoading(true);
      const studentList = await getCourseRoster(course.id);
      setRoster(studentList);
    } catch (err) {
      console.error("Error loading roster:", err);
      showToast("Could not load roster for " + course.title, "error");
    } finally {
      setRosterLoading(false);
    }
  };

  const handleUpdateGrade = (studentId, studentName) => {
    const newGrade = window.prompt(`Update semester grade for ${studentName}:`, "A (94%)");
    if (!newGrade) return;
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, grade: newGrade } : s))
    );
    showToast(`Updated grade for ${studentName} to ${newGrade}`, "success");
  };

  const handleExportRoster = () => {
    if (!selectedCourse || roster.length === 0) return;
    const rows = [
      ["Student Name", "Email", "Enrolled Date", "Progress %", "Grade", "Status"],
      ...roster.map((s) => [s.studentName, s.studentEmail, s.enrolledAt, `${s.progress}%`, s.grade || "In Progress", s.status])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `roster_${selectedCourse.id}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Class roster exported successfully.", "info");
  };

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
      <div className="courses-header-card">
        <div className="courses-header-text">
          <h1>My Assigned Courses & Class Rosters</h1>
          <p>
            Track student progress, monitor lesson completion, and review class attendance.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading assigned courses..." />
      ) : courses.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No Courses Assigned"
          description="You are not currently assigned to any math courses for this term."
        />
      ) : (
        <div className="catalog-grid">
          {courses.map((course) => (
            <div className="catalog-card" key={course.id}>
              <div className="catalog-card-header">
                <Badge variant="green">{course.category}</Badge>
                <span className="rating-pill">⭐ {course.rating || "5.0"}</span>
              </div>

              <h3 className="catalog-course-title">{course.title}</h3>
              <p className="catalog-course-desc">{course.description}</p>

              <div className="catalog-specs-list">
                <div className="spec-item">
                  <span>🗓️ Schedule:</span>
                  <strong>{course.schedule}</strong>
                </div>
                <div className="spec-item">
                  <span>👥 Enrolled Students:</span>
                  <strong>{course.enrolledCount} / {course.capacity}</strong>
                </div>
                <div className="spec-item">
                  <span>📊 Difficulty:</span>
                  <strong>{course.level}</strong>
                </div>
              </div>

              <div className="catalog-card-footer">
                <div className="course-fee-tag">
                  <span className="fee-amount">{course.enrolledCount || 0}</span>
                  <span className="fee-term">students</span>
                </div>

                <button
                  type="button"
                  className="enroll-action-btn"
                  style={{ background: "#0d9488" }}
                  onClick={() => handleOpenRoster(course)}
                >
                  📋 View Student Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Roster Modal */}
      {selectedCourse && (
        <Modal
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          title={`Class Roster: ${selectedCourse.title}`}
          size="lg"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              {roster.length > 0 && (
                <button
                  type="button"
                  className="details-btn"
                  onClick={handleExportRoster}
                  style={{ background: "#f0fdf4", color: "#166534", borderColor: "#86efac" }}
                >
                  📥 Export CSV
                </button>
              )}
              <button
                type="button"
                className="details-btn"
                onClick={() => setIsRosterModalOpen(false)}
              >
                Close Roster
              </button>
            </div>
          }
        >
          {rosterLoading ? (
            <LoadingSpinner text="Fetching class roster..." />
          ) : roster.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No Students Registered"
              description="There are currently no active students enrolled in this course batch."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="roster-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Enrolled Date</th>
                    <th>Progress</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <strong>{student.studentName}</strong>
                      </td>
                      <td style={{ color: "#64748b" }}>{student.studentEmail}</td>
                      <td>{student.enrolledAt}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "60px", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${student.progress}%`,
                                height: "100%",
                                background: student.progress >= 75 ? "#10b981" : "#0d9488"
                              }}
                            />
                          </div>
                          <span>{student.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#0f766e" }}>
                          {student.grade || "In Progress"}
                        </span>
                      </td>
                      <td>
                        <Badge variant={student.status === "ACTIVE" ? "green" : "gray"}>
                          {student.status || "ACTIVE"}
                        </Badge>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-blue"
                          onClick={() => handleUpdateGrade(student.id, student.studentName)}
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default TeacherCourses;
