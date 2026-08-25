import api from "./api";

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/users/me");
    if (res.data?.user) return res.data.user;
    if (res.data) return res.data;
  } catch (_err) {
    // If endpoint is not available or unauthenticated, check localStorage session fallback
  }

  const savedUser = localStorage.getItem("mathmastry_user");
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      // parse error
    }
  }

  return null;
};

export const updateCurrentUserProfile = async (profileData) => {
  try {
    const res = await api.patch("/users/me", profileData);
    if (res.data?.user) {
      localStorage.setItem("mathmastry_user", JSON.stringify(res.data.user));
      return res.data.user;
    }
    if (res.data) {
      localStorage.setItem("mathmastry_user", JSON.stringify(res.data));
      return res.data;
    }
  } catch (err) {
    console.warn("API /users/me PATCH unavailable, saving locally:", err.message);
  }

  // Update local storage fallback
  const existing = localStorage.getItem("mathmastry_user");
  let updated = { ...profileData };
  if (existing) {
    try {
      updated = { ...JSON.parse(existing), ...profileData };
    } catch {
      // ignore
    }
  }
  localStorage.setItem("mathmastry_user", JSON.stringify(updated));
  return updated;
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.warn("API /auth/logout failed:", err.message);
  }
  localStorage.removeItem("mathmastry_user");
  localStorage.removeItem("verificationEmail");
  localStorage.removeItem("loginEmail");
};

export const getRoleRedirectPath = (role) => {
  const normalized = (role || "").toUpperCase();
  if (normalized === "ADMIN") return "/admin";
  if (normalized === "TEACHER") return "/teacher";
  return "/dashboard";
};
