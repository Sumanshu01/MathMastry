import { useState, useEffect } from "react";
import { getDiscounts, reviewDiscount } from "../services/adminService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";
import "./AdminDashboard.css";

function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { showToast } = useToast();

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [approvedPercentage, setApprovedPercentage] = useState(20);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getDiscounts();
      setDiscounts(list);
    } catch (err) {
      console.error("Error loading discounts:", err);
      setError("Failed to load discount requests. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setApprovedPercentage(app.requestedPercentage || 20);
    setRejectReason("");
    setIsRejecting(false);
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      await reviewDiscount(selectedApp.id, "APPROVED", {
        approvedPercentage: Number(approvedPercentage),
        reason: "Approved by administration."
      });
      showToast(`Approved ${approvedPercentage}% discount for ${selectedApp.studentName}.`, "success");
      await loadDiscounts();
      setIsReviewModalOpen(false);
    } catch (err) {
      showToast("Failed to approve: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast("Please provide a reason for rejecting the discount request.", "warning");
      return;
    }
    try {
      await reviewDiscount(selectedApp.id, "REJECTED", {
        reason: rejectReason
      });
      showToast(`Discount request rejected for ${selectedApp.studentName}.`, "info");
      await loadDiscounts();
      setIsReviewModalOpen(false);
    } catch (err) {
      showToast("Failed to reject: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const filteredDiscounts = discounts.filter((d) => {
    if (statusFilter === "ALL") return true;
    return d.status === statusFilter;
  });

  return (
    <div className="admin-page-view">
      <div className="admin-card">
        <div className="admin-card-header-bar">
          <div>
            <h2>Sibling & Financial Assistance Requests</h2>
            <p>Review family enrollment documentation and approve tuition concessions.</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Applications</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="courses-error-banner" style={{ margin: "16px" }}>
            <span>⚠️ {error}</span>
            <button type="button" onClick={loadDiscounts} className="courses-retry-btn">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Fetching discount requests queue..." />
        ) : filteredDiscounts.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="No Discount Requests"
            description="There are currently no discount applications matching your filter."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Course Track</th>
                  <th>Discount Type</th>
                  <th>Sibling Reference</th>
                  <th>Requested %</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscounts.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.studentName}</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "12px" }}>
                        {d.studentEmail}
                      </p>
                    </td>
                    <td>{d.courseTitle}</td>
                    <td>
                      <Badge variant="purple">{d.discountType}</Badge>
                    </td>
                    <td style={{ fontSize: "13px", color: "#475569" }}>{d.siblingName}</td>
                    <td>
                      <strong style={{ color: "#d97706" }}>{d.requestedPercentage}%</strong>
                    </td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{d.appliedDate}</td>
                    <td>
                      <Badge
                        variant={
                          d.status === "APPROVED"
                            ? "green"
                            : d.status === "REJECTED"
                            ? "red"
                            : "yellow"
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn-sm admin-btn-blue"
                        onClick={() => handleOpenReview(d)}
                      >
                        {d.status === "PENDING" ? "Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Discount: ${selectedApp.studentName}`}
          footer={
            selectedApp.status === "PENDING" ? (
              <>
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-gray"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </button>
                {isRejecting ? (
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-red"
                    onClick={handleReject}
                  >
                    Confirm Rejection
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="admin-btn-sm admin-btn-red"
                      onClick={() => setIsRejecting(true)}
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      className="admin-primary-btn"
                      onClick={handleApprove}
                    >
                      Approve {approvedPercentage}% Discount
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                type="button"
                className="admin-btn-sm admin-btn-gray"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Close
              </button>
            )
          }
        >
          <div className="discount-form">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748b" }}>APPLICANT</p>
                <strong>{selectedApp.studentName}</strong>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748b" }}>COURSE</p>
                <strong>{selectedApp.courseTitle}</strong>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748b" }}>SIBLING DETAILS</p>
                <strong>{selectedApp.siblingName}</strong>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748b" }}>REQUESTED CONCESSION</p>
                <strong style={{ color: "#d97706" }}>{selectedApp.requestedPercentage}%</strong>
              </div>
            </div>

            {selectedApp.status === "PENDING" && !isRejecting && (
              <div className="form-group-item" style={{ marginTop: "12px" }}>
                <label>Set Approved Discount Concession (%) *</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={approvedPercentage}
                  onChange={(e) => setApprovedPercentage(e.target.value)}
                />
              </div>
            )}

            {isRejecting && (
              <div className="form-group-item" style={{ marginTop: "12px" }}>
                <label>Reason for Rejection *</label>
                <textarea
                  rows="3"
                  placeholder="State why this application was not approved (e.g. invalid sibling ID, not currently enrolled)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}

            {selectedApp.adminNotes && (
              <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
                <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                  Administrative Log
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                  {selectedApp.adminNotes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminDiscounts;
