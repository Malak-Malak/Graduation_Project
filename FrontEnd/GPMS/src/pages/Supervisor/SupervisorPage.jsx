import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

import SupervisorDashboard from "../../components/common/supervisor/Dashboard/SupervisorDashboard";
import GroupsList from "../../components/common/supervisor/Groups/GroupsList";
import PendingRequests from "../../components/common/supervisor/Pendingrequests/Pendingrequests";
import FileReview from "../../components/common/supervisor/FileReview/FileReview";
import SupervisorMeetings from "../../components/common/supervisor/Meetings/SupervisorMeetings";
import AIReports from "../../components/common/supervisor/AIReports/AIReports";
import SupervisorAnalytics from "../../components/common/supervisor/Analytics/SupervisorAnalytics";

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