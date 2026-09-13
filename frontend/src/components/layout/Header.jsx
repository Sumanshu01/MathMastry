import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationsDrawer from "./NotificationsDrawer";
import "./Layout.css";

export default function Header({ onMenuClick }) {
  const { user, role } = useAuth();
  const location = useLocation();

  // Determine current page subtitle and title
  const getPageInfo = () => {
    const p = location.pathname;
    if (p === "/dashboard") return { title: "Student Dashboard", subtitle: "Welcome back to your learning space" };
    if (p === "/courses") return { title: "Course Catalog & My Enrollments", subtitle: "Explore subjects and track enrolled modules" };
    if (p === "/progress") return { title: "Academic Progress", subtitle: "Track completion, performance, and grades" };
    if (p === "/profile" || p === "/teacher/profile") return { title: "Account Profile", subtitle: "Manage personal and contact details" };

    if (p === "/teacher") return { title: "Teacher Workspace", subtitle: "Overview of your assigned classes and student batches" };
    if (p === "/teacher/courses") return { title: "Assigned Courses & Rosters", subtitle: "Manage student attendance and module milestones" };
    if (p === "/teacher/availability") return { title: "Weekly Availability Scheduler", subtitle: "Set office hours and student slot limits" };

    if (p === "/admin") return { title: "Admin Center", subtitle: "High-level platform metrics and management tools" };
    if (p === "/admin/users") return { title: "User Directory", subtitle: "View, manage, and assign system user accounts" };
    if (p === "/admin/courses") return { title: "Course Management", subtitle: "Create, edit, and organize math course offerings" };
    if (p === "/admin/enrollments") return { title: "Enrollment Registry", subtitle: "Manage all student admissions and enrollment statuses" };
    if (p === "/admin/discounts") return { title: "Discount Requests Queue", subtitle: "Review and approve sibling and merit scholarships" };
    if (p === "/admin/reports") return { title: "Platform Analytics & Reports", subtitle: "Enrollment metrics, popularity, and revenue insights" };

    return { title: "MathMastry Portal", subtitle: "Premier Mathematics Learning Management" };
  };

  const { title, subtitle } = getPageInfo();
  const profileLink = role === "TEACHER" ? "/teacher/profile" : "/profile";

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ""}`.toUpperCase()
    : "MM";

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <div className="header-title-box">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        <NotificationsDrawer />

        <Link to={profileLink} className="header-user-badge">
          <div className="header-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">
              {user?.firstName || "User"} {user?.lastName || ""}
            </span>
            <span className="header-user-role">{role}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
