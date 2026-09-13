import api from "./api";

// Fallback seed courses
export const mockCourses = [
  {
    id: "c-101",
    title: "Foundations of Pure Mathematics",
    category: "Pure Mathematics",
    level: "Intermediate",
    description: "Deep dive into number theory, mathematical proofs, set theory, and formal logic structures.",
    teacherId: "t-1",
    teacherName: "Dr. Sarah Jenkins",
    schedule: "Mon & Wed • 4:00 PM - 5:30 PM",
    fee: 140,
    capacity: 25,
    enrolledCount: 18,
    rating: 4.9,
    modules: [
      { id: "m1", title: "Set Theory & Relations", duration: "2 weeks", lessons: 6 },
      { id: "m2", title: "Formal Proof Techniques", duration: "3 weeks", lessons: 8 },
      { id: "m3", title: "Number Theory Fundamentals", duration: "3 weeks", lessons: 9 }
    ]
  },
  {
    id: "c-102",
    title: "Advanced Algebra & Polynomial Equations",
    category: "Algebra",
    level: "Advanced",
    description: "Master quadratic systems, complex numbers, matrices, sequences, and polynomial root theorem.",
    teacherId: "t-2",
    teacherName: "Prof. Marcus Vance",
    schedule: "Tue & Thu • 5:00 PM - 6:30 PM",
    fee: 160,
    capacity: 20,
    enrolledCount: 19,
    rating: 4.8,
    modules: [
      { id: "m1", title: "Complex Number Field", duration: "2 weeks", lessons: 5 },
      { id: "m2", title: "Matrix Operations & Determinants", duration: "3 weeks", lessons: 7 },
      { id: "m3", title: "Polynomial Analysis", duration: "3 weeks", lessons: 8 }
    ]
  },
  {
    id: "c-103",
    title: "Euclidean & Analytic Geometry",
    category: "Geometry",
    level: "Beginner to Intermediate",
    description: "Explore geometric proofs, coordinate transformations, 3D spatial reasoning, and conic sections.",
    teacherId: "t-1",
    teacherName: "Dr. Sarah Jenkins",
    schedule: "Sat • 10:00 AM - 1:00 PM",
    fee: 130,
    capacity: 30,
    enrolledCount: 22,
    rating: 4.7,
    modules: [
      { id: "m1", title: "Axiomatic Geometry & Triangle Proofs", duration: "2 weeks", lessons: 6 },
      { id: "m2", title: "Coordinate Transformations", duration: "2 weeks", lessons: 5 },
      { id: "m3", title: "Conic Sections in 2D & 3D", duration: "3 weeks", lessons: 8 }
    ]
  },
  {
    id: "c-104",
    title: "Probability & Inferential Statistics",
    category: "Statistics",
    level: "Intermediate",
    description: "Essential data analysis, probability distributions, hypothesis testing, and regression modeling.",
    teacherId: "t-3",
    teacherName: "Elena Rostova, M.Sc.",
    schedule: "Fri • 4:30 PM - 7:00 PM",
    fee: 150,
    capacity: 25,
    enrolledCount: 14,
    rating: 4.9,
    modules: [
      { id: "m1", title: "Random Variables & Distributions", duration: "3 weeks", lessons: 7 },
      { id: "m2", title: "Hypothesis Testing & Confidence Intervals", duration: "3 weeks", lessons: 8 },
      { id: "m3", title: "Linear & Non-linear Regression", duration: "2 weeks", lessons: 5 }
    ]
  },
  {
    id: "c-105",
    title: "Calculus I: Limits, Derivatives & Applications",
    category: "Calculus",
    level: "Advanced",
    description: "Comprehensive study of limits, continuity, rate of change, derivatives, and optimization problems.",
    teacherId: "t-2",
    teacherName: "Prof. Marcus Vance",
    schedule: "Mon & Fri • 6:00 PM - 7:30 PM",
    fee: 175,
    capacity: 20,
    enrolledCount: 16,
    rating: 5.0,
    modules: [
      { id: "m1", title: "Limits & Continuity", duration: "2 weeks", lessons: 6 },
      { id: "m2", title: "Differentiation Rules & Chain Rule", duration: "3 weeks", lessons: 8 },
      { id: "m3", title: "Extrema & Optimization Applications", duration: "3 weeks", lessons: 7 }
    ]
  },
  {
    id: "c-106",
    title: "Olympiad Math & Creative Problem Solving",
    category: "Olympiad",
    level: "Elite",
    description: "Competition-level mathematics, combinatorics, pigeonhole principle, and non-standard problem solving.",
    teacherId: "t-1",
    teacherName: "Dr. Sarah Jenkins",
    schedule: "Sun • 2:00 PM - 5:00 PM",
    fee: 210,
    capacity: 15,
    enrolledCount: 12,
    rating: 5.0,
    modules: [
      { id: "m1", title: "Combinatorics & Pigeonhole Principle", duration: "3 weeks", lessons: 6 },
      { id: "m2", title: "Inequalities (AM-GM, Cauchy-Schwarz)", duration: "3 weeks", lessons: 8 },
      { id: "m3", title: "Non-standard Geometry Challenges", duration: "3 weeks", lessons: 7 }
    ]
  }
];

let localCoursesCache = [...mockCourses];

export const getCourses = async (params = {}) => {
  try {
    const res = await api.get("/courses", { params });
    if (res.data && Array.isArray(res.data.courses)) {
      return res.data.courses;
    }
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (err) {
    console.warn("API /courses unavailable, using local mock data:", err.message);
  }
  return localCoursesCache;
};

export const getCourseById = async (id) => {
  try {
    const res = await api.get(`/courses/${id}`);
    if (res.data && res.data.course) return res.data.course;
    if (res.data) return res.data;
  } catch (err) {
    console.warn(`API /courses/${id} unavailable, using local mock:`, err.message);
  }
  return localCoursesCache.find((c) => String(c.id) === String(id)) || null;
};

export const createCourse = async (courseData) => {
  try {
    const res = await api.post("/courses", courseData);
    if (res.data?.course) {
      localCoursesCache.unshift(res.data.course);
      return res.data.course;
    }
  } catch (err) {
    console.warn("API /courses POST unavailable, updating local mock:", err.message);
  }
  const newCourse = {
    ...courseData,
    id: `c-${Date.now()}`,
    enrolledCount: 0,
    rating: 5.0
  };
  localCoursesCache.unshift(newCourse);
  return newCourse;
};

export const updateCourse = async (id, courseData) => {
  try {
    const res = await api.patch(`/courses/${id}`, courseData);
    if (res.data?.course) {
      localCoursesCache = localCoursesCache.map((c) =>
        String(c.id) === String(id) ? res.data.course : c
      );
      return res.data.course;
    }
  } catch (err) {
    console.warn(`API /courses/${id} PATCH unavailable, updating local mock:`, err.message);
  }
  localCoursesCache = localCoursesCache.map((c) =>
    String(c.id) === String(id) ? { ...c, ...courseData } : c
  );
  return localCoursesCache.find((c) => String(c.id) === String(id));
};

export const deleteCourse = async (id) => {
  try {
    await api.delete(`/courses/${id}`);
  } catch (err) {
    console.warn(`API /courses/${id} DELETE unavailable, updating local mock:`, err.message);
  }
  localCoursesCache = localCoursesCache.filter((c) => String(c.id) !== String(id));
  return true;
};
