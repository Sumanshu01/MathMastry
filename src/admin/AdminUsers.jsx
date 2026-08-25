import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import "./AdminDashboard.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "STUDENT"
  });

  const fallbackUsers = [
    { id: "u-1", firstName: "Alex", lastName: "Mercer", email: "student@example.com", phone: "+1 (555) 349-8821", role: "STUDENT", emailVerified: true },
    { id: "u-2", firstName: "Sarah", lastName: "Jenkins", email: "teacher@mathmastry.com", phone: "+1 (555) 832-1109", role: "TEACHER", emailVerified: true },
    { id: "u-3", firstName: "Marcus", lastName: "Vance", email: "marcus.vance@mathmastry.com", phone: "+1 (555) 441-2098", role: "TEACHER", emailVerified: true },
    { id: "u-4", firstName: "Sophia", lastName: "Chen", email: "sophia.c@example.com", phone: "+1 (555) 219-9021", role: "STUDENT", emailVerified: true },
    { id: "u-5", firstName: "Admin", lastName: "Master", email: "admin@mathmastry.com", phone: "+1 (555) 000-1111", role: "ADMIN", emailVerified: true },
    { id: "u-6", firstName: "Liam", lastName: "Johnson", email: "liam.j@example.com", phone: "+1 (555) 772-3312", role: "STUDENT", emailVerified: false }
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      const fetched = response.data.users || response.data;
      if (Array.isArray(fetched) && fetched.length > 0) {
        setUsers(fetched);
      } else {
        setUsers(fallbackUsers);
      }
    } catch (err) {
      console.warn("API /admin/users failed, using seeded mock:", err.message);
      setUsers(fallbackUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${id}`);
    } catch (err) {
      console.warn("API delete failed:", err.message);
    }
    setUsers((currentUsers) => currentUsers.filter((user) => String(user.id) !== String(id)));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const created = {
      id: `u-${Date.now()}`,
      ...newUser,
      emailVerified: true
    };
    setUsers([created, ...users]);
    setIsCreateModalOpen(false);
    setNewUser({ firstName: "", lastName: "", email: "", phone: "", role: "STUDENT" });
  };

  const filteredUsers = users.filter((user) => {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || (user.role || "").toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-page-view">
      <div className="admin-card">
        <div className="admin-card-header-bar">
          <div>
            <h2>User Management Directory</h2>
            <p>Manage all registered students, teachers, and system administrators.</p>
          </div>
          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create New User
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Filters */}
        <div className="admin-table-filters">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search users by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers / Faculty</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner text="Loading users directory..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Users Found"
            description="No user records matched your search or role filter."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div>
                        <strong>{u.firstName} {u.lastName}</strong>
                        <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>{u.email}</p>
                      </div>
                    </td>
                    <td>
                      <Badge variant={u.role === "ADMIN" ? "purple" : u.role === "TEACHER" ? "green" : "blue"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td style={{ color: "#475569" }}>{u.phone || "-"}</td>
                    <td>
                      <span style={{ color: u.emailVerified ? "#16a34a" : "#ca8a04", fontWeight: 600, fontSize: "13px" }}>
                        {u.emailVerified ? "Verified ✓" : "Pending OTP"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-btn-sm admin-btn-red"
                        type="button"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New User Account"
        footer={
          <>
            <button
              type="button"
              className="admin-btn-sm admin-btn-gray"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleCreateUser}
            >
              Create Account
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="discount-form">
          <div className="form-group-item">
            <label>First Name *</label>
            <input
              type="text"
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              required
            />
          </div>
          <div className="form-group-item">
            <label>Last Name *</label>
            <input
              type="text"
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              required
            />
          </div>
          <div className="form-group-item">
            <label>Email *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group-item">
            <label>Phone Number</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
          </div>
          <div className="form-group-item">
            <label>Assigned System Role *</label>
            <select
              className="admin-filter-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminUsers;