// src/contexts/AuthContext.jsx
//
// user shape:
// {
//   id: string,
//   name: string,
//   email: string,
//   role: "admin" | "supervisor" | "student",
//   avatar?: string,
//   // student extras
//   studentId?: string,
//   year?: string,
//   department?: string,
//   teamId?: string,
//   teamName?: string,
//   // supervisor extras
//   title?: string,
// }
//
// currentPhase: "Phase1" | "Phase2"
//   Phase1 = Proposal phase (مقدمة المشروع)
//   Phase2 = Project phase  (المشروع الفعلي)
//   Only meaningful when role === "student"

import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

// ── helpers ──────────────────────────────────────────────────────────────────
const PHASE_KEY = "gpms_current_phase";

const readPhase = () =>
  sessionStorage.getItem(PHASE_KEY) || "Phase1";

const writePhase = (phase) =>
  sessionStorage.setItem(PHASE_KEY, phase);

// ─────────────────────────────────────────────────────────────────────────────

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

  // currentPhase — only used when role === "student"
  // persisted in sessionStorage so it survives soft refreshes
  const [currentPhase, setCurrentPhase] = useState(() => readPhase());

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    sessionStorage.setItem("gpms_user", JSON.stringify(userData));
    sessionStorage.setItem("gpms_token", accessToken);

    // Reset phase to Phase1 on every fresh login
    // (will be overwritten after getCurrentVersion API call in StudentPage)
    writePhase("Phase1");
    setCurrentPhase("Phase1");
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("gpms_user");
    sessionStorage.removeItem("gpms_token");
    sessionStorage.removeItem(PHASE_KEY);
    setCurrentPhase("Phase1");
  }, []);

  // ── updateUser ────────────────────────────────────────────────────────────
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      sessionStorage.setItem("gpms_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── setPhase ──────────────────────────────────────────────────────────────
  // Called after API confirms the switch or on load (getCurrentVersion).
  // phase: "Phase1" | "Phase2"
  const setPhase = useCallback((phase) => {
    const normalised = phase === "Phase2" ? "Phase2" : "Phase1";
    writePhase(normalised);
    setCurrentPhase(normalised);
  }, []);

  // ── derived ───────────────────────────────────────────────────────────────
  const isAuthenticated = Boolean(user && token);
  const role = user?.role ?? null; // "admin" | "supervisor" | "student" | null
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
        // phase
        currentPhase,   // "Phase1" | "Phase2"
        isPhase2,       // boolean shortcut
        setPhase,       // (phase: string) => void
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