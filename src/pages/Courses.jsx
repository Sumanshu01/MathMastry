import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../services/courseService";
import { getMyEnrollments, enrollInCourse } from "../services/enrollmentService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import "./Courses.css";

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  // Modals state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Sibling discount modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({ siblingName: "", siblingEmail: "", notes: "" });
  const [discountSuccess, setDiscountSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [courseList, myEnrollments] = await Promise.all([
          getCourses(),
          getMyEnrollments()
        ]);
        setCourses(courseList);
        setEnrollments(myEnrollments);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const enrolledCourseIds = new Set(enrollments.map((e) => String(e.courseId)));

  const categories = ["ALL", "Pure Mathematics", "Algebra", "Geometry", "Statistics", "Calculus", "Olympiad"];
  const levels = ["ALL", "Beginner to Intermediate", "Intermediate", "Advanced", "Elite"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.teacherName && course.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || course.category === selectedCategory;

    const matchesLevel =
      selectedLevel === "ALL" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleOpenDetail = (course) => {
    setSelectedCourse(course);
    setIsDetailModalOpen(true);
  };

  const handleEnroll = async (course) => {
    try {
      setIsEnrolling(true);
      await enrollInCourse(course.id);
      const updated = await getMyEnrollments();
      setEnrollments(updated);
      setIsDetailModalOpen(false);
      setToastMessage(`Successfully enrolled in ${course.title}!`);
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err) {
      alert("Enrollment failed: " + err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDiscountSubmit = (e) => {
    e.preventDefault();
    setDiscountSuccess(true);
    setTimeout(() => {
      setIsDiscountModalOpen(false);
      setDiscountSuccess(false);
      setDiscountForm({ siblingName: "", siblingEmail: "", notes: "" });
      setToastMessage("Sibling discount request submitted to administration!");
      setTimeout(() => setToastMessage(""), 4000);
    }, 1500);
  };

  return (
    <div className="courses-page-view">
      {toastMessage && (
        <div className="toast-notification">
          <span>✅ {toastMessage}</span>
          <button type="button" onClick={() => setToastMessage("")}>&times;</button>
        </div>
      )}

      {/* Header & Sibling Banner */}
      <div className="courses-header-card">
        <div className="courses-header-text">
          <h1>Mathematics Course Catalog</h1>
          <p>
            Explore our rigorous mathematics curriculum taught by expert instructors.
          </p>
        </div>

        <button
          type="button"
          className="discount-apply-btn"
          onClick={() => setIsDiscountModalOpen(true)}
        >
          👨‍👩‍👧 Apply for Sibling Discount
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-controls-bar">
        <div className="search-input-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by topic, keyword, or instructor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              &times;
            </button>
          )}
        </div>

        <div className="level-select-wrapper">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="ALL">All Levels</option>
            {levels.filter((l) => l !== "ALL").map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-row">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "ALL" ? "All Subjects" : cat}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching math courses..." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Matching Courses"
          description="We couldn't find any courses matching your filters. Try adjusting your search query or filter tags."
          action={
            <button
              type="button"
              className="category-pill active"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
                setSelectedLevel("ALL");
              }}
            >
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="catalog-grid">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(String(course.id));
            const availableSeats = Math.max(0, course.capacity - (course.enrolledCount || 0));

            return (
              <div className="catalog-card" key={course.id}>
                <div className="catalog-card-header">
                  <Badge variant={course.level === "Elite" ? "purple" : course.level === "Advanced" ? "red" : "blue"}>
                    {course.level}
                  </Badge>
                  <span className="rating-pill">⭐ {course.rating || "4.9"}</span>
                </div>

                <h3 className="catalog-course-title">{course.title}</h3>
                <p className="catalog-course-desc">{course.description}</p>

                <div className="catalog-specs-list">
                  <div className="spec-item">
                    <span>👨‍🏫 Instructor:</span>
                    <strong>{course.teacherName}</strong>
                  </div>
                  <div className="spec-item">
                    <span>🗓️ Schedule:</span>
                    <strong>{course.schedule}</strong>
                  </div>
                  <div className="spec-item">
                    <span>👥 Seats:</span>
                    <strong>
                      {availableSeats > 0 ? `${availableSeats} seats left` : "Full Capacity"}
                    </strong>
                  </div>
                </div>

                <div className="catalog-card-footer">
                  <div className="course-fee-tag">
                    <span className="fee-amount">${course.fee}</span>
                    <span className="fee-term">/ semester</span>
                  </div>

                  <div className="catalog-card-actions">
                    <button
                      type="button"
                      className="details-btn"
                      onClick={() => handleOpenDetail(course)}
                    >
                      Syllabus
                    </button>

                    {isEnrolled ? (
                      <button
                        type="button"
                        className="enrolled-btn"
                        onClick={() => navigate("/dashboard")}
                      >
                        Enrolled ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="enroll-action-btn"
                        onClick={() => handleEnroll(course)}
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? "Enrolling..." : "Enroll"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Detail & Syllabus Modal */}
      {selectedCourse && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedCourse.title}
          size="lg"
          footer={
            <>
              <button
                type="button"
                className="details-btn"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
              {enrolledCourseIds.has(String(selectedCourse.id)) ? (
                <button
                  type="button"
                  className="enrolled-btn"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  Go to Course Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  className="enroll-action-btn"
                  onClick={() => handleEnroll(selectedCourse)}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? "Processing..." : `Enroll for $${selectedCourse.fee}`}
                </button>
              )}
            </>
          }
        >
          <div className="modal-syllabus-content">
            <div className="modal-course-info-grid">
              <div className="modal-info-tile">
                <p>Instructor</p>
                <strong>{selectedCourse.teacherName}</strong>
              </div>
              <div className="modal-info-tile">
                <p>Schedule</p>
                <strong>{selectedCourse.schedule}</strong>
              </div>
              <div className="modal-info-tile">
                <p>Difficulty Level</p>
                <strong>{selectedCourse.level}</strong>
              </div>
              <div className="modal-info-tile">
                <p>Tuition Fee</p>
                <strong>${selectedCourse.fee} USD</strong>
              </div>
            </div>

            <div className="syllabus-section">
              <h4>📖 Comprehensive Course Syllabus</h4>
              <div className="modules-accordion">
                {selectedCourse.modules && selectedCourse.modules.map((mod, idx) => (
                  <div className="module-item" key={mod.id || idx}>
                    <div className="module-header">
                      <span className="module-num">Module {idx + 1}</span>
                      <strong>{mod.title}</strong>
                      <span className="module-meta">{mod.duration} • {mod.lessons} Lessons</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="course-learning-outcomes">
              <h4>🎯 What You Will Master</h4>
              <ul>
                <li>Rigorous proof techniques and logical deduction.</li>
                <li>Intuitive visual understanding and problem decomposition.</li>
                <li>Direct weekly mentorship & office hour problem clinics.</li>
                <li>Official MathMastry Course Certificate upon milestone completion.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* Sibling Discount Request Modal */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Apply for Sibling / Family Discount"
        footer={
          !discountSuccess && (
            <>
              <button
                type="button"
                className="details-btn"
                onClick={() => setIsDiscountModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="enroll-action-btn"
                onClick={handleDiscountSubmit}
              >
                Submit Application
              </button>
            </>
          )
        }
      >
        {discountSuccess ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <h3>Application Received</h3>
            <p style={{ color: "#4b5563" }}>
              Our administration will verify the sibling details and apply the discount to your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDiscountSubmit} className="discount-form">
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
              Families with two or more students enrolled in MathMastry qualify for a 20-25% discount on subsequent enrollments.
            </p>

            <div className="form-group-item">
              <label>Sibling Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Maya Mercer"
                value={discountForm.siblingName}
                onChange={(e) => setDiscountForm({ ...discountForm, siblingName: e.target.value })}
                required
              />
            </div>

            <div className="form-group-item">
              <label>Sibling Enrolled Email / Student ID *</label>
              <input
                type="text"
                placeholder="e.g. maya.mercer@example.com or ID-982"
                value={discountForm.siblingEmail}
                onChange={(e) => setDiscountForm({ ...discountForm, siblingEmail: e.target.value })}
                required
              />
            </div>

            <div className="form-group-item">
              <label>Notes / Proof of Relation (Optional)</label>
              <textarea
                rows="3"
                placeholder="Provide any additional details or semester batch information..."
                value={discountForm.notes}
                onChange={(e) => setDiscountForm({ ...discountForm, notes: e.target.value })}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Courses;
