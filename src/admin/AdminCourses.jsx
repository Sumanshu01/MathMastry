import { useState, useEffect } from "react";
import { getCourses, createCourse, updateCourse, deleteCourse } from "../services/courseService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";
import "./AdminDashboard.css";

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Pure Mathematics",
    level: "Intermediate",
    description: "",
    teacherName: "Dr. Sarah Jenkins",
    schedule: "Mon & Wed • 4:00 PM - 5:30 PM",
    fee: 150,
    capacity: 25
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getCourses();
      setCourses(list);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      category: "Pure Mathematics",
      level: "Intermediate",
      description: "",
      teacherName: "Dr. Sarah Jenkins",
      schedule: "Mon & Wed • 4:00 PM - 5:30 PM",
      fee: 150,
      capacity: 25
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      category: course.category,
      level: course.level,
      description: course.description,
      teacherName: course.teacherName,
      schedule: course.schedule,
      fee: course.fee,
      capacity: course.capacity
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Course title is required.", "warning");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Course syllabus description is required.", "warning");
      return;
    }
    if (Number(formData.fee) < 0) {
      showToast("Tuition fee must be a valid non-negative amount.", "warning");
      return;
    }
    if (Number(formData.capacity) < 1) {
      showToast("Course capacity must be at least 1 student.", "warning");
      return;
    }

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        showToast("Course updated successfully!", "success");
      } else {
        await createCourse(formData);
        showToast("New course published successfully!", "success");
      }
      await loadCourses();
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to save course: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => String(c.id) !== String(id)));
      showToast("Course removed from catalog.", "info");
    } catch (err) {
      showToast("Failed to delete course: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-page-view">
      <div className="admin-card">
        <div className="admin-card-header-bar">
          <div>
            <h2>Course Catalog Management</h2>
            <p>Create, update, assign faculty, and manage enrollment capacities.</p>
          </div>
          <button type="button" className="admin-primary-btn" onClick={handleOpenCreate}>
            + Add New Math Course
          </button>
        </div>

        {error && (
          <div className="courses-error-banner" style={{ margin: "16px" }}>
            <span>⚠️ {error}</span>
            <button type="button" onClick={loadCourses} className="courses-retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="admin-table-filters">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search courses by title or assigned faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Pure Mathematics">Pure Mathematics</option>
            <option value="Algebra">Algebra</option>
            <option value="Geometry">Geometry</option>
            <option value="Statistics">Statistics</option>
            <option value="Calculus">Calculus</option>
            <option value="Olympiad">Olympiad</option>
          </select>
        </div>

        {/* Courses Table */}
        {loading ? (
          <LoadingSpinner text="Loading course catalog..." />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No Courses Found"
            description="No course offerings match your filter criteria."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Category & Level</th>
                  <th>Assigned Faculty</th>
                  <th>Schedule</th>
                  <th>Capacity</th>
                  <th>Tuition Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.title}</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "12px", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.description}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Badge variant="blue">{c.category}</Badge>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{c.level}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{c.teacherName}</strong>
                    </td>
                    <td style={{ fontSize: "13px", color: "#475569" }}>{c.schedule}</td>
                    <td>
                      <span>{c.enrolledCount || 0} / {c.capacity}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f766e" }}>${c.fee}</strong>
                    </td>
                    <td>
                      <div className="admin-action-btn-group">
                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-blue"
                          onClick={() => handleOpenEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-red"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.title}` : "Create New Math Course"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="admin-btn-sm admin-btn-gray"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleSubmit}
            >
              {editingCourse ? "Save Changes" : "Publish Course"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="discount-form">
          <div className="form-group-item">
            <label>Course Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group-item">
              <label>Category *</label>
              <select
                className="admin-filter-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Pure Mathematics">Pure Mathematics</option>
                <option value="Algebra">Algebra</option>
                <option value="Geometry">Geometry</option>
                <option value="Statistics">Statistics</option>
                <option value="Calculus">Calculus</option>
                <option value="Olympiad">Olympiad</option>
              </select>
            </div>

            <div className="form-group-item">
              <label>Difficulty Level *</label>
              <select
                className="admin-filter-select"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group-item">
              <label>Assigned Faculty Instructor *</label>
              <select
                className="admin-filter-select"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              >
                <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Cambridge)</option>
                <option value="Prof. Marcus Vance">Prof. Marcus Vance (MIT)</option>
                <option value="Elena Rostova, M.Sc.">Elena Rostova, M.Sc. (Stanford)</option>
              </select>
            </div>

            <div className="form-group-item">
              <label>Class Schedule *</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group-item">
              <label>Tuition Fee (USD) *</label>
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group-item">
              <label>Student Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-group-item">
            <label>Course Syllabus Description *</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCourses;
