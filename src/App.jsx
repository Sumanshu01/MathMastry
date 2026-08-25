import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Auth & Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import LoginVerify from "./pages/LoginVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Route Guards & Layout
import PublicRoute from "./components/routes/PublicRoute";
import RoleRoute from "./components/routes/RoleRoute";
import Layout from "./components/layout/Layout";

// Student Portal Pages
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";

// Teacher Portal Pages
import TeacherDashboard from "./teacher/TeacherDashboard";
import TeacherCourses from "./teacher/TeacherCourses";
import TeacherAvailability from "./teacher/TeacherAvailability";
import TeacherProfile from "./teacher/TeacherProfile";

// Admin Suite Pages
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminCourses from "./admin/AdminCourses";
import AdminEnrollments from "./admin/AdminEnrollments";
import AdminDiscounts from "./admin/AdminDiscounts";
import AdminReports from "./admin/AdminReports";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Flow */}
          <Route element={<PublicRoute restricted />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login-verify" element={<LoginVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Student Portal (STUDENT role) */}
          <Route element={<RoleRoute allowedRoles={["STUDENT"]} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Teacher Portal (TEACHER role) */}
          <Route element={<RoleRoute allowedRoles={["TEACHER"]} />}>
            <Route element={<Layout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<TeacherCourses />} />
              <Route path="/teacher/availability" element={<TeacherAvailability />} />
              <Route path="/teacher/profile" element={<TeacherProfile />} />
            </Route>
          </Route>

          {/* Admin Suite (ADMIN role) */}
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              <Route path="/admin/discounts" element={<AdminDiscounts />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
