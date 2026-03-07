import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/common/Layout/MainLayout";

import StudentDashboard from "../../components/student/Dashboard/StudentDashboard";
import TeamFinder from "../../components/student/TeamFinder/TeamFinder";
import KanbanBoard from "../../components/student/KanbanBoard/KanbanBoard";
import FileRepository from "../../components/student/FileRepository/FileRepository";
import StudentMeetings from "../../components/student/Meetings/StudentMeetings";
import StudentAnalytics from "../../components/student/Analytics/StudentAnalytics";

export default function StudentPage() {
    return (
        <MainLayout>
            <Routes>
                <Route index element={<StudentDashboard />} />
                <Route path="team-finder" element={<TeamFinder />} />
                <Route path="kanban" element={<KanbanBoard />} />
                <Route path="files" element={<FileRepository />} />
                <Route path="meetings" element={<StudentMeetings />} />
                <Route path="analytics" element={<StudentAnalytics />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
            </Routes>
        </MainLayout>
    );
}