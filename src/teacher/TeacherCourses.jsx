import { useState, useEffect } from "react";
import { getTeacherCourses, getCourseRoster } from "../services/teacherService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import "./Teacher.css";

function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roster state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getTeacherCourses();
        setCourses(list);
      } catch (err) {
        console.error("Error loading assigned courses:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
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
    } finally {
      setRosterLoading(false);
    }
  };

  return (
    <div className="teacher-page-view">
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
            <button
              type="button"
              className="details-btn"
              onClick={() => setIsRosterModalOpen(false)}
            >
              Close Roster
            </button>
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
