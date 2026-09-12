import api from "./api";
import { getCourses } from "./courseService";
import { getAllEnrollments } from "./enrollmentService";

export const mockDiscounts = [
  {
    id: "disc-1",
    studentName: "Alex Mercer",
    studentEmail: "student@example.com",
    courseTitle: "Advanced Algebra & Polynomial Equations",
    discountType: "SIBLING",
    siblingName: "Maya Mercer (Class 9)",
    siblingStudentId: "u-sibling-98",
    appliedDate: "2026-02-20",
    requestedPercentage: 20,
    status: "PENDING",
    proofDocumentName: "enrollment_receipt_sibling.pdf",
    adminNotes: ""
  },
  {
    id: "disc-2",
    studentName: "Liam Johnson",
    studentEmail: "liam.j@example.com",
    courseTitle: "Foundations of Pure Mathematics",
    discountType: "EARLY_BIRD",
    siblingName: "-",
    appliedDate: "2026-02-18",
    requestedPercentage: 15,
    status: "APPROVED",
    approvedPercentage: 15,
    reviewedBy: "Admin",
    reviewedAt: "2026-02-19",
    adminNotes: "Eligible for semester launch discount."
  },
  {
    id: "disc-3",
    studentName: "Sophia Chen",
    studentEmail: "sophia.c@example.com",
    courseTitle: "Calculus I: Limits & Derivatives",
    discountType: "SIBLING",
    siblingName: "Lucas Chen (Class 11)",
    appliedDate: "2026-02-22",
    requestedPercentage: 25,
    status: "PENDING",
    proofDocumentName: "family_id_card.pdf",
    adminNotes: ""
  },
  {
    id: "disc-4",
    studentName: "David Miller",
    studentEmail: "david.m@example.com",
    courseTitle: "Probability & Inferential Statistics",
    discountType: "MERIT",
    siblingName: "-",
    appliedDate: "2026-02-15",
    requestedPercentage: 30,
    status: "REJECTED",
    reviewedBy: "Admin",
    reviewedAt: "2026-02-16",
    adminNotes: "Merit score threshold (95%+) was not satisfied."
  }
];

export const mockAdminReports = {
  summary: {
    totalRevenue: 24850,
    revenueGrowth: "+18.4%",
    activeEnrollments: 94,
    enrollmentGrowth: "+12.1%",
    activeStudents: 120,
    studentGrowth: "+24.5%",
    courseCount: 6,
    avgCompletionRate: 68.5
  },
  monthlyTrends: [
    { month: "Sep", enrollments: 38, revenue: 5320 },
    { month: "Oct", enrollments: 45, revenue: 6300 },
    { month: "Nov", enrollments: 62, revenue: 8680 },
    { month: "Dec", enrollments: 58, revenue: 8120 },
    { month: "Jan", enrollments: 82, revenue: 11480 },
    { month: "Feb", enrollments: 94, revenue: 13160 }
  ],
  categoryBreakdown: [
    { category: "Pure Mathematics", count: 28, percentage: 30, revenue: 3920 },
    { category: "Algebra", count: 24, percentage: 25, revenue: 3840 },
    { category: "Geometry", count: 18, percentage: 19, revenue: 2340 },
    { category: "Statistics", count: 14, percentage: 15, revenue: 2100 },
    { category: "Olympiad & Calculus", count: 10, percentage: 11, revenue: 1950 }
  ]
};

let localDiscountsCache = [...mockDiscounts];

export const getAdminStats = async () => {
  try {
    const res = await api.get("/admin/stats");
    if (res.data?.stats) return res.data.stats;
    if (res.data) return res.data;
  } catch (err) {
    console.warn("API /admin/stats unavailable, computing dynamic platform aggregates:", err.message);
  }

  let courses = [];
  let enrollments = [];
  try {
    courses = await getCourses();
    enrollments = await getAllEnrollments();
  } catch {
    // ignore
  }

  const courseCount = Array.isArray(courses) ? courses.length : 6;
  const enrollmentCount = Array.isArray(enrollments) ? enrollments.length : 94;

  let calcRevenue = 0;
  if (Array.isArray(courses) && courses.length > 0) {
    calcRevenue = courses.reduce((sum, c) => sum + (c.fee || 150) * (c.enrolledCount || 15), 0);
  } else {
    calcRevenue = 13160;
  }

  let avgComp = 68.5;
  if (Array.isArray(enrollments) && enrollments.length > 0) {
    const totalProg = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    avgComp = (totalProg / enrollments.length).toFixed(1);
  }

  const pendingDiscounts = localDiscountsCache.filter((d) => d.status === "PENDING").length;

  return {
    totalUsers: 120,
    totalCourses: courseCount,
    totalEnrollments: enrollmentCount,
    pendingDiscounts,
    monthlyRevenue: `$${calcRevenue.toLocaleString()}`,
    completionRate: `${avgComp}%`
  };
};

export const getDiscounts = async () => {
  try {
    const res = await api.get("/admin/discounts");
    if (res.data && Array.isArray(res.data.discounts)) return res.data.discounts;
    if (res.data && Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.warn("API /admin/discounts unavailable, using mock:", err.message);
  }
  return localDiscountsCache;
};

export const reviewDiscount = async (discountId, status, payload = {}) => {
  try {
    const res = await api.patch(`/admin/discounts/${discountId}`, { status, ...payload });
    if (res.data?.discount) {
      localDiscountsCache = localDiscountsCache.map((d) =>
        String(d.id) === String(discountId) ? res.data.discount : d
      );
      return res.data.discount;
    }
  } catch (err) {
    console.warn(`API /admin/discounts/${discountId} review unavailable, updating locally:`, err.message);
  }
  localDiscountsCache = localDiscountsCache.map((d) => {
    if (String(d.id) === String(discountId)) {
      return {
        ...d,
        status,
        approvedPercentage: status === "APPROVED" ? (payload.approvedPercentage || d.requestedPercentage) : 0,
        adminNotes: payload.reason || payload.adminNotes || (status === "APPROVED" ? "Approved by Admin" : "Rejected"),
        reviewedAt: new Date().toISOString().split("T")[0]
      };
    }
    return d;
  });
  return localDiscountsCache.find((d) => String(d.id) === String(discountId));
};

export const getAdminReports = async () => {
  try {
    const res = await api.get("/admin/reports");
    if (res.data?.reports) return res.data.reports;
    if (res.data) return res.data;
  } catch (err) {
    console.warn("API /admin/reports unavailable, using mock reports:", err.message);
  }
  return mockAdminReports;
};
