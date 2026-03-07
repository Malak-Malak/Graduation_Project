// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import RequestRegister from "../features/auth/pages/RequestRegister";
// import Login from "../features/auth/pages/Login";

// export default function AppRoutes({ toggleTheme }) {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={<RequestRegister toggleTheme={toggleTheme} />}
//         />
//         <Route
//           path="/login"
//           element={<Login toggleTheme={toggleTheme} />}
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import RequestRegister from "../pages/Register/RequestRegister";
// import Login from "../pages/Login/Login";
// import Home from "../features/auth/pages/Home"; // 👈 أضفناها

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* الصفحة الرئيسية */}
//         <Route path="/" element={<Home />} />

//         {/* تسجيل الدخول */}
//         <Route path="/login" element={<Login />} />

//         {/* طلب إنشاء حساب */}
//         <Route path="/request-register" element={<RequestRegister />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import AuthContextProvider from "../contexts/AuthContext";
// import PrivateRoute from "./PrivateRoute";
// import RoleRoute from "./RoleRoute";

// // Pages (lazy-loaded for performance)
// import { lazy, Suspense } from "react";
// import PageLoader from "../components/common/PageLoader";

// const LoginPage = lazy(() => import("../pages/Login/Login"));
// const AdminPage = lazy(() => import("../pages/Admin/AdminPage"));
// const SupervisorPage = lazy(() => import("../pages/Supervisor/SupervisorPage"));
// const StudentPage = lazy(() => import("../pages/Student/StudentPage"));
// const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));
// const RequestRegister = lazy(() => import("../pages/RequestRegister/RequestRegister"));
// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <AuthContextProvider>
//         <Suspense fallback={<PageLoader />}>
//           <Routes>
//             {/* Public */}
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<RequestRegister />} />
//             {/* Protected + role-gated */}
//             <Route element={<PrivateRoute />}>
//               <Route
//                 path="/admin/*"
//                 element={
//                   <RoleRoute allowedRoles={["admin"]}>
//                     <AdminPage />
//                   </RoleRoute>
//                 }
//               />
//               <Route
//                 path="/supervisor/*"
//                 element={
//                   <RoleRoute allowedRoles={["supervisor"]}>
//                     <SupervisorPage />
//                   </RoleRoute>
//                 }
//               />
//               <Route
//                 path="/student/*"
//                 element={
//                   <RoleRoute allowedRoles={["student"]}>
//                     <StudentPage />
//                   </RoleRoute>
//                 }
//               />
//             </Route>

//             {/* Default redirect */}
//             <Route path="/" element={<Navigate to="/login" replace />} />

//             {/* 404 */}
//             <Route path="*" element={<NotFoundPage />} />
//           </Routes>
//         </Suspense>
//       </AuthContextProvider>
//     </BrowserRouter>
//   );
// }
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