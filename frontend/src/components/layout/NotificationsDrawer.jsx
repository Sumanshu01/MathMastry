import { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/notificationService";
import { useToast } from "../../context/ToastContext";

export default function NotificationsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const drawerRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    getNotifications().then((list) => {
      if (active && Array.isArray(list)) {
        setNotifications(list);
      }
    });

    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      active = false;
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = async () => {
    const updated = await markAllNotificationsRead();
    setNotifications(updated);
    showToast("All notifications marked as read.", "info");
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      const updated = await markNotificationRead(notif.id);
      setNotifications(updated);
    }
  };

  const displayedNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    return true;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case "ACADEMIC":
        return { label: "Academic", bg: "#e0f2fe", color: "#0369a1" };
      case "SCHEDULE":
        return { label: "Schedule", bg: "#fef3c7", color: "#b45309" };
      case "ACHIEVEMENT":
        return { label: "Milestone", bg: "#dcfce7", color: "#15803d" };
      default:
        return { label: "System", bg: "#f3e8ff", color: "#7e22ce" };
    }
  };

  return (
    <div className="notif-wrapper" ref={drawerRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div>
              <h4>Notifications</h4>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "All caught up"}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-read-all-btn"
                onClick={handleMarkAll}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", padding: "8px 16px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              style={{
                border: "none",
                background: activeTab === "all" ? "#2563eb" : "transparent",
                color: activeTab === "all" ? "white" : "#64748b",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              style={{
                border: "none",
                background: activeTab === "unread" ? "#2563eb" : "transparent",
                color: activeTab === "unread" ? "white" : "#64748b",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="notif-list">
            {displayedNotifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>📭</div>
                {activeTab === "unread" ? "No unread notifications" : "No notifications right now"}
              </div>
            ) : (
              displayedNotifications.map((n) => {
                const badge = getTypeBadge(n.type);
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.read ? "unread" : ""}`}
                    onClick={() => handleItemClick(n)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleItemClick(n);
                    }}
                  >
                    <div className="notif-item-title">
                      <span style={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: badge.bg,
                            color: badge.color,
                            fontWeight: 600,
                            textTransform: "uppercase"
                          }}
                        >
                          {badge.label}
                        </span>
                        {!n.read && <span className="unread-dot" />}
                      </div>
                    </div>
                    <p className="notif-item-msg">{n.message}</p>
                    <span className="notif-item-time">{n.timestamp}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

