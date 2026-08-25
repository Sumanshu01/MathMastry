import { useState, useEffect } from "react";
import { getAdminReports } from "../services/adminService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Badge from "../components/common/Badge";
import "./AdminDashboard.css";

function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAdminReports();
        setReports(data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportCSV = () => {
    if (!reports) return;
    const rows = [
      ["Category", "Students Enrolled", "Revenue (USD)", "Market Share %"],
      ...reports.categoryBreakdown.map((c) => [c.category, c.count, `$${c.revenue}`, `${c.percentage}%`])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mathmastry_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-page-view">
      <div className="admin-hero-banner" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}>
        <div>
          <h1>Platform Analytics & Executive Reports</h1>
          <p>
            Real-time telemetry on student enrollment velocity, subject popularity, and semester revenue.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-btn"
          style={{ background: "#4f46e5" }}
          onClick={handleExportCSV}
        >
          📥 Export CSV Summary
        </button>
      </div>

      {loading || !reports ? (
        <LoadingSpinner text="Computing platform metrics & charts..." />
      ) : (
        <>
          {/* Executive Summary Cards */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper green">💰</div>
              <div className="stat-details">
                <p>Semester Revenue</p>
                <h2>${reports.summary.totalRevenue.toLocaleString()}</h2>
                <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                  {reports.summary.revenueGrowth} vs last term
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper blue">📈</div>
              <div className="stat-details">
                <p>Active Enrollments</p>
                <h2>{reports.summary.activeEnrollments}</h2>
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: 700 }}>
                  {reports.summary.enrollmentGrowth} vs last term
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper purple">🎓</div>
              <div className="stat-details">
                <p>Registered Students</p>
                <h2>{reports.summary.activeStudents}</h2>
                <span style={{ fontSize: "12px", color: "#9333ea", fontWeight: 700 }}>
                  {reports.summary.studentGrowth} vs last term
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper yellow">🎯</div>
              <div className="stat-details">
                <p>Avg Course Completion</p>
                <h2>{reports.summary.avgCompletionRate}%</h2>
                <span style={{ fontSize: "12px", color: "#ca8a04", fontWeight: 700 }}>
                  High Engagement
                </span>
              </div>
            </div>
          </section>

          {/* Charts Row */}
          <div className="analytics-grid">
            {/* Monthly Trend Chart */}
            <div className="chart-card">
              <div className="chart-title-row">
                <div>
                  <h3>Monthly Enrollment Trends</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Student enrollment count per month
                  </p>
                </div>
                <Badge variant="blue">Active Term</Badge>
              </div>

              <div className="chart-svg-container">
                {reports.monthlyTrends.map((trend) => {
                  const heightPercent = Math.min(100, Math.round((trend.enrollments / 100) * 100));
                  return (
                    <div className="bar-chart-column" key={trend.month}>
                      <span className="bar-value">{trend.enrollments}</span>
                      <div
                        className="bar-pill"
                        style={{ height: `${heightPercent}%` }}
                        title={`${trend.month}: ${trend.enrollments} enrollments ($${trend.revenue})`}
                      />
                      <span className="bar-label">{trend.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Popularity Share */}
            <div className="chart-card">
              <div className="chart-title-row">
                <div>
                  <h3>Subject Area Distribution</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Enrollment breakdown across mathematical domains
                  </p>
                </div>
                <Badge variant="green">Mastery Tracks</Badge>
              </div>

              <div className="category-progress-list">
                {reports.categoryBreakdown.map((cat, idx) => {
                  const colors = ["#2563eb", "#0d9488", "#7c3aed", "#d97706", "#dc2626"];
                  const color = colors[idx % colors.length];
                  return (
                    <div className="cat-item-row" key={cat.category}>
                      <div className="cat-header">
                        <span>{cat.category}</span>
                        <strong style={{ color }}>{cat.percentage}% ({cat.count} students)</strong>
                      </div>
                      <div className="cat-bar-track">
                        <div
                          className="cat-bar-fill"
                          style={{ width: `${cat.percentage * 2}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="admin-card">
            <div className="admin-card-header-bar">
              <div>
                <h3>Subject Revenue Generation Breakdown</h3>
                <p>Financial performance and tuition volume aggregated by mathematics discipline.</p>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Mathematical Discipline</th>
                    <th>Active Enrollments</th>
                    <th>Revenue Contribution</th>
                    <th>Market Share</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.categoryBreakdown.map((cat) => (
                    <tr key={cat.category}>
                      <td>
                        <strong>{cat.category}</strong>
                      </td>
                      <td>{cat.count} Students</td>
                      <td>
                        <strong style={{ color: "#0f766e" }}>${cat.revenue.toLocaleString()}</strong>
                      </td>
                      <td>{cat.percentage}%</td>
                      <td>
                        <Badge variant={cat.percentage >= 20 ? "green" : "blue"}>
                          {cat.percentage >= 20 ? "Top Performing" : "Growing"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminReports;
