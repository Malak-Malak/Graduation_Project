import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/common/Layout/MainLayout";

import SupervisorDashboard from "../../components/supervisor/Dashboard/SupervisorDashboard";
import GroupsList from "../../components/supervisor/Groups/GroupsList";
import PendingRequests from "../../components/supervisor/PendingRequests/PendingRequests";
import FileReview from "../../components/supervisor/FileReview/FileReview";
import SupervisorMeetings from "../../components/supervisor/Meetings/SupervisorMeetings";
import AIReports from "../../components/supervisor/AIReports/AIReports";
import SupervisorAnalytics from "../../components/supervisor/Analytics/SupervisorAnalytics";

export default function SupervisorPage() {
    return (
        <MainLayout>
            <Routes>
                <Route index element={<SupervisorDashboard />} />
                <Route path="groups" element={<GroupsList />} />
                <Route path="requests" element={<PendingRequests />} />
                <Route path="files" element={<FileReview />} />
                <Route path="meetings" element={<SupervisorMeetings />} />
                <Route path="ai-reports" element={<AIReports />} />
                <Route path="analytics" element={<SupervisorAnalytics />} />
                <Route path="*" element={<Navigate to="/supervisor" replace />} />
            </Routes>
        </MainLayout>
    );
}