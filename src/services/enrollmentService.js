import api from "./api";
import { mockCourses } from "./courseService";

export const mockEnrollments = [
  {
    id: "enr-1",
    courseId: "c-101",
    courseTitle: "Foundations of Pure Mathematics",
    category: "Pure Mathematics",
    teacherName: "Dr. Sarah Jenkins",
    studentId: "u-student-1",
    studentName: "Alex Mercer",
    studentEmail: "student@example.com",
    enrolledAt: "2026-01-15",
    progress: 75,
    completedLessons: 18,
    totalLessons: 23,
    status: "ACTIVE",
    lastAccessed: "2 hours ago",
    grade: "A (92%)"
  },
  {
    id: "enr-2",
    courseId: "c-102",
    courseTitle: "Advanced Algebra & Polynomial Equations",
    category: "Algebra",
    teacherName: "Prof. Marcus Vance",
    studentId: "u-student-1",
    studentName: "Alex Mercer",
    studentEmail: "student@example.com",
    enrolledAt: "2026-02-01",
    progress: 60,
    completedLessons: 12,
    totalLessons: 20,
    status: "ACTIVE",
    lastAccessed: "Yesterday",
    grade: "B+ (88%)"
  },
  {
    id: "enr-3",
    courseId: "c-103",
    courseTitle: "Euclidean & Analytic Geometry",
    category: "Geometry",
    teacherName: "Dr. Sarah Jenkins",
    studentId: "u-student-1",
    studentName: "Alex Mercer",
    studentEmail: "student@example.com",
    enrolledAt: "2026-02-10",
    progress: 45,
    completedLessons: 9,
    totalLessons: 19,
    status: "ACTIVE",
    lastAccessed: "3 days ago",
    grade: "B (84%)"
  },
  {
    id: "enr-4",
    courseId: "c-104",
    courseTitle: "Probability & Inferential Statistics",
    category: "Statistics",
    teacherName: "Elena Rostova, M.Sc.",
    studentId: "u-student-1",
    studentName: "Alex Mercer",
    studentEmail: "student@example.com",
    enrolledAt: "2026-02-18",
    progress: 30,
    completedLessons: 6,
    totalLessons: 20,
    status: "ACTIVE",
    lastAccessed: "5 days ago",
    grade: "In Progress"
  },
  {
    id: "enr-5",
    courseId: "c-105",
    courseTitle: "Calculus I: Limits & Derivatives",
    category: "Calculus",
    teacherName: "Prof. Marcus Vance",
    studentId: "u-student-2",
    studentName: "Sophia Chen",
    studentEmail: "sophia.c@example.com",
    enrolledAt: "2026-01-20",
    progress: 85,
    completedLessons: 17,
    totalLessons: 21,
    status: "ACTIVE",
    lastAccessed: "1 day ago",
    grade: "A+ (96%)"
  },
  {
    id: "enr-6",
    courseId: "c-101",
    courseTitle: "Foundations of Pure Mathematics",
    category: "Pure Mathematics",
    teacherName: "Dr. Sarah Jenkins",
    studentId: "u-student-3",
    studentName: "Liam Johnson",
    studentEmail: "liam.j@example.com",
    enrolledAt: "2026-02-05",
    progress: 40,
    completedLessons: 9,
    totalLessons: 23,
    status: "ACTIVE",
    lastAccessed: "4 days ago",
    grade: "B (82%)"
  },
  {
    id: "enr-7",
    courseId: "c-106",
    courseTitle: "Olympiad Math & Problem Solving",
    category: "Olympiad",
    teacherName: "Dr. Sarah Jenkins",
    studentId: "u-student-4",
    studentName: "Emma Watson",
    studentEmail: "emma.w@example.com",
    enrolledAt: "2026-02-12",
    progress: 90,
    completedLessons: 19,
    totalLessons: 21,
    status: "ACTIVE",
    lastAccessed: "Today",
    grade: "A+ (98%)"
  }
];

let localEnrollmentsCache = [...mockEnrollments];

export const getMyEnrollments = async () => {
  try {
    const res = await api.get("/enrollments/my");
    if (res.data && Array.isArray(res.data.enrollments)) return res.data.enrollments;
    if (res.data && Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.warn("API /enrollments/my unavailable, using local mock:", err.message);
  }
  return localEnrollmentsCache.filter(
    (e) => e.studentEmail === "student@example.com" || e.studentId === "u-student-1"
  );
};

export const getAllEnrollments = async (params = {}) => {
  try {
    const res = await api.get("/admin/enrollments", { params });
    if (res.data && Array.isArray(res.data.enrollments)) return res.data.enrollments;
    if (res.data && Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.warn("API /admin/enrollments unavailable, using local mock:", err.message);
  }
  return localEnrollmentsCache;
};

export const enrollInCourse = async (courseId) => {
  try {
    const res = await api.post("/enrollments", { courseId });
    if (res.data?.enrollment) {
      localEnrollmentsCache.push(res.data.enrollment);
      return res.data.enrollment;
    }
  } catch (err) {
    console.warn("API /enrollments POST unavailable, creating local enrollment:", err.message);
  }

  const course = mockCourses.find((c) => String(c.id) === String(courseId));
  const newEnrollment = {
    id: `enr-${Date.now()}`,
    courseId,
    courseTitle: course ? course.title : "Math Course",
    category: course ? course.category : "General",
    teacherName: course ? course.teacherName : "Math Faculty",
    studentId: "u-student-1",
    studentName: "Alex Mercer",
    studentEmail: "student@example.com",
    enrolledAt: new Date().toISOString().split("T")[0],
    progress: 0,
    completedLessons: 0,
    totalLessons: 20,
    status: "ACTIVE",
    lastAccessed: "Just now",
    grade: "Not graded"
  };
  localEnrollmentsCache.unshift(newEnrollment);
  return newEnrollment;
};

export const updateEnrollmentStatus = async (id, status) => {
  try {
    const res = await api.patch(`/admin/enrollments/${id}`, { status });
    if (res.data?.enrollment) {
      localEnrollmentsCache = localEnrollmentsCache.map((e) =>
        String(e.id) === String(id) ? res.data.enrollment : e
      );
      return res.data.enrollment;
    }
  } catch (err) {
    console.warn(`API /admin/enrollments/${id} PATCH unavailable, updating local:`, err.message);
  }
  localEnrollmentsCache = localEnrollmentsCache.map((e) =>
    String(e.id) === String(id) ? { ...e, status } : e
  );
  return localEnrollmentsCache.find((e) => String(e.id) === String(id));
};
