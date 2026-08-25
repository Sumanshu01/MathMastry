import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logoutUser, getRoleRedirectPath } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mathmastry_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default fallback demo user if testing
    return {
      id: "u-student-1",
      firstName: "Alex",
      lastName: "Mercer",
      email: "student@example.com",
      phone: "+1 (555) 349-8821",
      role: "STUDENT",
      emailVerified: true
    };
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted && currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("mathmastry_user", JSON.stringify(userData));
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("mathmastry_user", JSON.stringify(updated));
  };

  const setRoleForTesting = (newRole) => {
    const updated = {
      ...user,
      role: newRole,
      firstName: newRole === "ADMIN" ? "Platform" : newRole === "TEACHER" ? "Sarah" : "Alex",
      lastName: newRole === "ADMIN" ? "Administrator" : newRole === "TEACHER" ? "Jenkins" : "Mercer",
      email: newRole === "ADMIN" ? "admin@mathmastry.com" : newRole === "TEACHER" ? "teacher@mathmastry.com" : "student@example.com"
    };
    setUser(updated);
    localStorage.setItem("mathmastry_user", JSON.stringify(updated));
  };

  const value = {
    user,
    role: user?.role ? user.role.toUpperCase() : "STUDENT",
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser,
    setRoleForTesting,
    getRedirectPath: () => getRoleRedirectPath(user?.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
