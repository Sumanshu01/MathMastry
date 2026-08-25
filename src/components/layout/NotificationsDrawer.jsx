import { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/notificationService";

export default function NotificationsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const drawerRef = useRef(null);

  const loadNotifs = async () => {
    const list = await getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifs();

    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = async () => {
    const updated = await markAllNotificationsRead();
    setNotifications(updated);
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      const updated = await markNotificationRead(notif.id);
      setNotifications(updated);
    }
  };

  return (
    <div className="notif-wrapper" ref={drawerRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4>Notifications {unreadCount > 0 && `(${unreadCount} new)`}</h4>
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

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? "unread" : ""}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className="notif-item-title">
                    <span>{n.title}</span>
                    {!n.read && <span className="unread-dot" />}
                  </div>
                  <p className="notif-item-msg">{n.message}</p>
                  <span className="notif-item-time">{n.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
