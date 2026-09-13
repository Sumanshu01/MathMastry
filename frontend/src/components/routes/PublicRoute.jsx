import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicRoute({ restricted = false }) {
  const { isAuthenticated, loading, getRedirectPath } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading MathMastry...</p>
      </div>
    );
  }

  // If user is already authenticated and this is a restricted auth route (like /login or /register), redirect to their portal
  if (isAuthenticated && restricted) {
    return <Navigate to={getRedirectPath()} replace />;
  }

  return <Outlet />;
}
