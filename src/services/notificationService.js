import api from "./api";

export const mockNotifications = [
  {
    id: "notif-1",
    title: "New Quiz Available",
    message: "Module 2: Proof Techniques Quiz has been published in Foundations of Pure Mathematics.",
    type: "ACADEMIC",
    read: false,
    timestamp: "10 mins ago"
  },
  {
    id: "notif-2",
    title: "Class Schedule Update",
    message: "Algebra session on Thursday is shifted to 5:30 PM with Prof. Marcus Vance.",
    type: "SCHEDULE",
    read: false,
    timestamp: "2 hours ago"
  },
  {
    id: "notif-3",
    title: "Discount Application Status",
    message: "Your sibling discount request of 20% is currently under review by the administration.",
    type: "SYSTEM",
    read: true,
    timestamp: "1 day ago"
  },
  {
    id: "notif-4",
    title: "Milestone Achieved 🎉",
    message: "You have completed 75% of your Mathematics course! Keep up the momentum.",
    type: "ACHIEVEMENT",
    read: true,
    timestamp: "3 days ago"
  }
];

let localNotificationsCache = [...mockNotifications];

export const getNotifications = async () => {
  try {
    const res = await api.get("/notifications");
    if (res.data && Array.isArray(res.data.notifications)) return res.data.notifications;
    if (res.data && Array.isArray(res.data)) return res.data;
  } catch {
    // Falls back to local stub
  }
  return localNotificationsCache;
};

export const markNotificationRead = async (id) => {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch {
    // Falls back to local stub
  }
  localNotificationsCache = localNotificationsCache.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  return localNotificationsCache;
};

export const markAllNotificationsRead = async () => {
  try {
    await api.patch("/notifications/read-all");
  } catch {
    // Falls back to local stub
  }
  localNotificationsCache = localNotificationsCache.map((n) => ({ ...n, read: true }));
  return localNotificationsCache;
};
