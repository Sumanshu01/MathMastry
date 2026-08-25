import api from "./api";
import { mockCourses } from "./courseService";
import { mockEnrollments } from "./enrollmentService";

export const mockTeacherAvailability = {
  timezone: "UTC+00:00 (London)",
  weeklyHoursLimit: 25,
  slots: [
    { day: "Monday", enabled: true, startTime: "09:00", endTime: "17:00", maxStudentsPerSlot: 4 },
    { day: "Tuesday", enabled: true, startTime: "10:00", endTime: "16:00", maxStudentsPerSlot: 3 },
    { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "17:00", maxStudentsPerSlot: 4 },
    { day: "Thursday", enabled: true, startTime: "10:00", endTime: "16:00", maxStudentsPerSlot: 3 },
    { day: "Friday", enabled: true, startTime: "09:00", endTime: "15:00", maxStudentsPerSlot: 5 },
    { day: "Saturday", enabled: false, startTime: "10:00", endTime: "14:00", maxStudentsPerSlot: 2 },
    { day: "Sunday", enabled: false, startTime: "10:00", endTime: "14:00", maxStudentsPerSlot: 2 }
  ],
  officeHoursNotice: "Available on Discord/Slack channel every weekday between 4:00 PM - 5:00 PM."
};

let localAvailabilityCache = { ...mockTeacherAvailability };

export const getTeacherCourses = async () => {
  try {
    const res = await api.get("/teachers/me/courses");
    if (res.data && Array.isArray(res.data.courses)) return res.data.courses;
    if (res.data && Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.warn("API /teachers/me/courses unavailable, using local mock:", err.message);
  }
  return mockCourses.filter((c) => c.teacherId === "t-1" || c.teacherName.includes("Sarah"));
};

export const getCourseRoster = async (courseId) => {
  try {
    const res = await api.get(`/teachers/me/courses/${courseId}/roster`);
    if (res.data && Array.isArray(res.data.roster)) return res.data.roster;
  } catch (err) {
    console.warn(`API roster for ${courseId} unavailable, using mock:`, err.message);
  }
  return mockEnrollments.filter((e) => String(e.courseId) === String(courseId));
};

export const getTeacherAvailability = async () => {
  try {
    const res = await api.get("/teachers/me/availability");
    if (res.data?.availability) return res.data.availability;
  } catch (err) {
    console.warn("API /teachers/me/availability GET unavailable, using mock:", err.message);
  }
  return localAvailabilityCache;
};

export const updateTeacherAvailability = async (availabilityData) => {
  try {
    const res = await api.patch("/teachers/me/availability", availabilityData);
    if (res.data?.availability) {
      localAvailabilityCache = res.data.availability;
      return res.data.availability;
    }
  } catch (err) {
    console.warn("API /teachers/me/availability PATCH unavailable, saving locally:", err.message);
  }
  localAvailabilityCache = { ...localAvailabilityCache, ...availabilityData };
  return localAvailabilityCache;
};
