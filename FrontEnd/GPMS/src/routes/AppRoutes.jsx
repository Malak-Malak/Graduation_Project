
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import AuthContextProvider from "../contexts/AuthContext";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import PageLoader from "../components/common/PageLoader";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));        // ✅ الصفحة الرئيسية
const LoginPage = lazy(() => import("../pages/Login/Login"));
const RequestRegister = lazy(() => import("../pages/Register/RequestRegister"));
const AdminPage = lazy(() => import("../pages/Admin/AdminPage"));
const SupervisorPage = lazy(() => import("../pages/Supervisor/SupervisorPage"));
const StudentPage = lazy(() => import("../pages/Student/StudentPage"));
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));
// const UserProfilePage = lazy(() => import("./../pages/UserProfile/UserProfilePage"));
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public ── */}
            <Route path="/" element={<LandingPage />} />      {/* ✅ الصفحة الرئيسية */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RequestRegister />} />

            {/* ── Protected + role-gated ── */}
            <Route element={<PrivateRoute />}>
              <Route
                path="/admin/*"
                element={<RoleRoute allowedRoles={["admin"]}><AdminPage /></RoleRoute>}
              />
              <Route
                path="/supervisor/*"
                element={<RoleRoute allowedRoles={["supervisor"]}><SupervisorPage /></RoleRoute>}
              />
              <Route
                path="/student/*"
                element={<RoleRoute allowedRoles={["student"]}><StudentPage /></RoleRoute>}
              />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </AuthContextProvider>
    </BrowserRouter>
  );
}