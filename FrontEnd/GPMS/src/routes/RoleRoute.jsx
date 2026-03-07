import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ROLE_HOME = {
  admin: "/admin",
  supervisor: "/supervisor",
  student: "/student",
};

/**
 * Guards a route by role.
 * If the user's role is not in allowedRoles, they are sent to their own home.
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    const home = ROLE_HOME[role] ?? "/login";
    return <Navigate to={home} replace />;
  }

  return children;
}