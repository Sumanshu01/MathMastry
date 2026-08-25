import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAdminStats } from "../services/adminService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Badge from "../components/common/Badge";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const recentLogs = [
    { id: "log-1", event: "New Enrollment", detail: "Alex Mercer enrolled in Pure Mathematics", time: "15 mins ago", status: "COMPLETED" },
    { id: "log-2", event: "Discount Applied", detail: "Sibling discount request submitted by Sophia Chen", time: "1 hour ago", status: "PENDING" },
    { id: "log-3", event: "Course Created", detail: "Calculus I: Limits & Derivatives added by Admin", time: "3 hours ago", status: "COMPLETED" },
    { id: "log-4", event: "User Verified", detail: "Teacher account Dr. Sarah Jenkins activated", time: "Yesterday", status: "COMPLETED" }
  ];

  return (
    <div className="admin-page-view">
      {/* Banner */}
      <div className="admin-hero-banner">
        <div>
          <h1>MathMastry Central Administration</h1>
          <p>
            Oversee platform metrics, manage user permissions, monitor courses, and process scholarships.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-btn"
          style={{ background: "#3b82f6" }}
          onClick={() => navigate("/admin/courses")}
        >
          + Add New Course
        </button>
      </div>

      {/* Live Metrics Grid */}
      {loading || !stats ? (
        <LoadingSpinner text="Aggregating platform metrics..." />
      ) : (
        <section className="stats-grid">
          <div className="stat-card" onClick={() => navigate("/admin/users")} style={{ cursor: "pointer" }}>
            <div className="stat-icon-wrapper blue">👥</div>
            <div className="stat-details">
              <p>Total Registered Users</p>
              <h2>{stats.totalUsers}</h2>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/admin/courses")} style={{ cursor: "pointer" }}>
            <div className="stat-icon-wrapper green">📚</div>
            <div className="stat-details">
              <p>Active Math Courses</p>
              <h2>{stats.totalCourses}</h2>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/admin/enrollments")} style={{ cursor: "pointer" }}>
            <div className="stat-icon-wrapper purple">📝</div>
            <div className="stat-details">
              <p>Total Enrollments</p>
              <h2>{stats.totalEnrollments}</h2>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/admin/discounts")} style={{ cursor: "pointer" }}>
            <div className="stat-icon-wrapper yellow">🏷️</div>
            <div className="stat-details">
              <p>Pending Discounts</p>
              <h2>{stats.pendingDiscounts}</h2>
            </div>
          </div>
        </section>
      )}

      {/* Secondary Metrics Bar */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">💰</div>
          <div className="stat-details">
            <p>Monthly Platform Revenue</p>
            <h2>{stats?.monthlyRevenue || "$13,160"}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">🎯</div>
          <div className="stat-details">
            <p>Average Student Completion Rate</p>
            <h2>{stats?.completionRate || "68.5%"}</h2>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="admin-card">
        <div className="admin-card-header-bar">
          <div>
            <h3>Recent System Activity & Audit Trail</h3>
            <p>Live stream of enrollments, discount requests, and administrative actions.</p>
          </div>
          <Link to="/admin/reports" className="view-all-button">
            View Analytics Reports →
          </Link>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Details</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.event}</strong>
                  </td>
                  <td>{log.detail}</td>
                  <td style={{ color: "#64748b", fontSize: "13px" }}>{log.time}</td>
                  <td>
                    <Badge variant={log.status === "COMPLETED" ? "green" : "yellow"}>
                      {log.status}
                    </Badge>
                  </td>
                  <td>
                    {log.event.includes("Discount") ? (
                      <button
                        type="button"
                        className="admin-btn-sm admin-btn-blue"
                        onClick={() => navigate("/admin/discounts")}
                      >
                        Review
                      </button>
                    ) : log.event.includes("Enrollment") ? (
                      <button
                        type="button"
                        className="admin-btn-sm admin-btn-gray"
                        onClick={() => navigate("/admin/enrollments")}
                      >
                        Details
                      </button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;