import { createContext, useContext, useState, useCallback } from "react";

/**
 * user shape:
 * {
 *   id: string,
 *   name: string,
 *   email: string,
 *   role: "admin" | "supervisor" | "student",
 *   avatar?: string,
 *   // student extras
 *   studentId?: string,
 *   year?: string,
 *   department?: string,
 *   teamId?: string,
 *   teamName?: string,
 *   // supervisor extras
 *   title?: string,
 * }
 */

const AuthContext = createContext(null);

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

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    sessionStorage.setItem("gpms_user", JSON.stringify(userData));
    sessionStorage.setItem("gpms_token", accessToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("gpms_user");
    sessionStorage.removeItem("gpms_token");
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      sessionStorage.setItem("gpms_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAuthenticated = Boolean(user && token);
  const role = user?.role ?? null; // "admin" | "supervisor" | "student" | null

  return (
    <AuthContext.Provider
      value={{ user, token, role, isAuthenticated, login, logout, updateUser }}
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