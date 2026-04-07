// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const PHASE_KEY = "gpms_current_phase";
const readPhase = () => sessionStorage.getItem(PHASE_KEY) || "Phase1";
const writePhase = (phase) => sessionStorage.setItem(PHASE_KEY, phase);

export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("gpms_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("gpms_token") || null
  );

  const [currentPhase, setCurrentPhase] = useState(() => readPhase());

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    sessionStorage.setItem("gpms_user", JSON.stringify(userData));
    sessionStorage.setItem("gpms_token", accessToken);
    writePhase("Phase1");
    setCurrentPhase("Phase1");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("gpms_user");
    sessionStorage.removeItem("gpms_token");
    sessionStorage.removeItem(PHASE_KEY);
    sessionStorage.removeItem("gpms_profile_done"); // ✅ امسح الـ flag عند الـ logout
    setCurrentPhase("Phase1");
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      sessionStorage.setItem("gpms_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setPhase = useCallback((phase) => {
    const normalised = phase === "Phase2" ? "Phase2" : "Phase1";
    writePhase(normalised);
    setCurrentPhase(normalised);
  }, []);

  const isAuthenticated = Boolean(user && token);
  const role = user?.role ?? null;
  const isPhase2 = currentPhase === "Phase2";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        login,
        logout,
        updateUser,
        currentPhase,
        isPhase2,
        setPhase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used inside AuthContextProvider");
  return ctx;
};