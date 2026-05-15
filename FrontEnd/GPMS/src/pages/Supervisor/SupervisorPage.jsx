// src/pages/Supervisor/SupervisorPage.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

import SupervisorDashboard from "../../components/common/supervisor/Dashboard/SupervisorDashboard";
import GroupsList from "../../components/common/supervisor/Groups/GroupsList";
import PendingRequests from "../../components/common/supervisor/Pendingrequests/Pendingrequests";
import FileReview from "../../components/common/supervisor/FileReview/FileReview";
import SupervisorMeetings from "../../components/common/supervisor/Meetings/SupervisorMeetings";
import AIReports from "../../components/common/supervisor/AIReports/AIReports";
import SupervisorAnalytics from "../../components/common/supervisor/Analytics/SupervisorAnalytics";
import ProfilePage from "../../components/common/student/Profile/ProfilePage";
import SubmittedTeams from "../../components/common/supervisor/Archive/SubmittedTeams";
import HeadOfDepartmentPage from "../../components/common/supervisor/HeadOfDepartment/HeadOfDepartmentPage";

import { useAuth } from "../../contexts/AuthContext";


/* ─────────────────────────────────────────────────────────────────────────────
   HOD Guard — renders children only if the logged-in supervisor is a head.
   Falls back gracefully: shows nothing (or a redirect) if not authorised.
───────────────────────────────────────────────────────────────────────────── */
function HodGuard({ isHead, children }) {
    if (!isHead) return <Navigate to="/supervisor" replace />;
    return children;
}

export default function SupervisorPage() {
    const { user, updateUser } = useAuth();
    const isHead = Boolean(user?.isHeadOfDepartment);

    return (
        <MainLayout isHeadOfDepartment={isHead}>
            <Routes>
                <Route index element={<SupervisorDashboard />} />
                <Route path="groups" element={<GroupsList />} />
                <Route path="requests" element={<PendingRequests />} />
                <Route path="files" element={<FileReview />} />
                <Route path="meetings" element={<SupervisorMeetings />} />
                <Route path="ai-reports" element={<AIReports />} />
                <Route path="analytics" element={<SupervisorAnalytics />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="archive" element={<SubmittedTeams />} />

                {/* Head of Department — only accessible if isHead === true */}
                <Route
                    path="head-of-department"
                    element={
                        <HodGuard isHead={isHead}>
                            <HeadOfDepartmentPage />
                        </HodGuard>
                    }
                />

                <Route path="*" element={<Navigate to="/supervisor" replace />} />
            </Routes>
        </MainLayout>
    );
}