import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  // Nav menus by role
  const studentNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/courses", label: "My Courses", icon: "📚" },
    { to: "/progress", label: "Progress", icon: "📈" },
    { to: "/profile", label: "Profile", icon: "👤" }
  ];

  const teacherNavItems = [
    { to: "/teacher", label: "Dashboard", icon: "📊" },
    { to: "/teacher/courses", label: "Courses & Rosters", icon: "📖" },
    { to: "/teacher/availability", label: "Availability", icon: "⏱️" },
    { to: "/teacher/profile", label: "Teacher Profile", icon: "👨‍🏫" }
  ];

  const adminNavItems = [
    { to: "/admin", label: "Dashboard", icon: "⚡" },
    { to: "/admin/users", label: "Users Management", icon: "👥" },
    { to: "/admin/courses", label: "Course Catalog", icon: "📚" },
    { to: "/admin/enrollments", label: "Enrollments", icon: "📝" },
    { to: "/admin/discounts", label: "Discounts Queue", icon: "🏷️" },
    { to: "/admin/reports", label: "Analytics & Reports", icon: "📈" }
  ];

  let currentNavItems = studentNavItems;
  let homePath = "/dashboard";

  if (role === "TEACHER") {
    currentNavItems = teacherNavItems;
    homePath = "/teacher";
  } else if (role === "ADMIN") {
    currentNavItems = adminNavItems;
    homePath = "/admin";
  }

  return (
    <>
      <div
        className={`mobile-backdrop ${mobileOpen ? "mobile-open" : ""}`}
        onClick={closeMobile}
      />
      <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <NavLink to={homePath} className="sidebar-brand" onClick={closeMobile}>
          <div className="brand-icon">∑</div>
          <span className="brand-title">MathMastry</span>
          <span className="role-tag-pill">{role}</span>
        </NavLink>

        <nav className="sidebar-nav">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard" || item.to === "/teacher" || item.to === "/admin"}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? "active" : ""}`
              }
              onClick={closeMobile}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>


        <button className="sidebar-logout-btn" type="button" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
