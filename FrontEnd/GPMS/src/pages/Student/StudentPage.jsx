import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

import StudentDashboard from "../../components/common/student/StudentDashboard/StudentDashboard";
import TeamFinder from "../../components/common/student/TeamFinder/TeamFinder";
import KanbanBoard from "../../components/common/student/KanbanBoard/KanbanBoard";
import FileRepository from "../../components/common/student/FileRepository/FileRepository";
import StudentMeetings from "../../components/common/student/Meetings/StudentMeetings";
import StudentAnalytics from "../../components/common/student/Analytics/StudentAnalytics";

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