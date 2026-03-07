import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

import AdminDashboard from "../../components/common/admin/Dashboard/AdminDashboard";
import UserManagement from "../../components/common/admin/UserManagement/UserManagement";
import Reports from "../../components/common/admin/Reports/Reports";
import ActivityLogs from "../../components/common/admin/ActivityLogs/ActivityLogs";
import SystemConfiguration from "../../components/common/admin/SystemConfiguration/SystemConfiguration";
import PendingRequests from "../../components/common/admin/PendingRequests/PendingRequests";
import AllRequests from "../../components/common/admin/AllRequests/AllRequests"; // ✅

export default function AdminPage() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="settings" element={<SystemConfiguration />} />
        <Route path="pending-requests" element={<PendingRequests />} /> {/* ✅ */}
        <Route path="all-requests" element={<AllRequests />} /> {/* ✅ */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </MainLayout>
  );
}