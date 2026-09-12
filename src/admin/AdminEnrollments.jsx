import { useState, useEffect } from "react";
import { getAllEnrollments, updateEnrollmentStatus } from "../services/enrollmentService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";
import "./AdminDashboard.css";

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { showToast } = useToast();

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getAllEnrollments();
      setEnrollments(list);
    } catch (err) {
      console.error("Error loading enrollments:", err);
      setError("Failed to load enrollment records. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEnrollmentStatus(id, newStatus);
      setEnrollments((prev) =>
        prev.map((e) => (String(e.id) === String(id) ? { ...e, status: newStatus } : e))
      );
      showToast(`Enrollment status updated to ${newStatus}`, "success");
    } catch (err) {
      showToast("Failed to update status: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const student = (e.studentName || "").toLowerCase();
    const course = (e.courseTitle || "").toLowerCase();
    const email = (e.studentEmail || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = student.includes(term) || course.includes(term) || email.includes(term);
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-view">
      <div className="admin-card">
        <div className="admin-card-header-bar">
          <div>
            <h2>Student Enrollment Registry</h2>
            <p>Monitor student admissions, adjust enrollment status, and review progress.</p>
          </div>
          <span className="badge badge-blue">{filteredEnrollments.length} Total Records</span>
        </div>

        {error && (
          <div className="courses-error-banner" style={{ margin: "16px" }}>
            <span>⚠️ {error}</span>
            <button type="button" onClick={loadEnrollments} className="courses-retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="admin-table-filters">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by student name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Approval</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Fetching enrollment records..." />
        ) : filteredEnrollments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Enrollments Found"
            description="No student records matched your current query or filter."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Enrolled Course</th>
                  <th>Faculty</th>
                  <th>Date</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Manage Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enr) => (
                  <tr key={enr.id}>
                    <td>
                      <strong>{enr.studentName}</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "12px" }}>
                        {enr.studentEmail}
                      </p>
                    </td>
                    <td>
                      <strong>{enr.courseTitle}</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "12px" }}>
                        {enr.category}
                      </p>
                    </td>
                    <td style={{ fontSize: "13px" }}>{enr.teacherName}</td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{enr.enrolledAt}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${enr.progress}%`,
                              height: "100%",
                              background: enr.progress >= 75 ? "#10b981" : "#2563eb"
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>{enr.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge
                        variant={
                          enr.status === "ACTIVE"
                            ? "green"
                            : enr.status === "COMPLETED"
                            ? "purple"
                            : enr.status === "PENDING"
                            ? "yellow"
                            : "red"
                        }
                      >
                        {enr.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="admin-action-btn-group">
                        {enr.status !== "ACTIVE" && (
                          <button
                            type="button"
                            className="admin-btn-sm admin-btn-green"
                            onClick={() => handleStatusChange(enr.id, "ACTIVE")}
                          >
                            Activate
                          </button>
                        )}
                        {enr.status !== "COMPLETED" && (
                          <button
                            type="button"
                            className="admin-btn-sm admin-btn-blue"
                            onClick={() => handleStatusChange(enr.id, "COMPLETED")}
                          >
                            Complete
                          </button>
                        )}
                        {enr.status !== "CANCELLED" && (
                          <button
                            type="button"
                            className="admin-btn-sm admin-btn-red"
                            onClick={() => handleStatusChange(enr.id, "CANCELLED")}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEnrollments;
