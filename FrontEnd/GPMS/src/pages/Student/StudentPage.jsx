import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";

import MainLayout from "../../layout/MainLayout";
import StudentDashboard from "../../components/common/student/StudentDashboard/StudentDashboard";
import TeamFinder from "../../components/common/student/TeamFinder/TeamFinder";
import KanbanBoard from "../../components/common/student/KanbanBoard/KanbanBoard";
import FileRepository from "../../components/common/student/FileRepository/FileRepository";
import StudentMeetings from "../../components/common/student/Meetings/StudentMeetings";
import StudentAnalytics from "../../components/common/student/Analytics/StudentAnalytics";

import OnboardingGate from "../../components/common/student/Onboarding/OnboardingGate";
import JoinOrCreateModal from "../../components/common/student/Onboarding/JoinOrCreateModal";
import CreateTeamFlow from "../../components/common/student/Onboarding/CreateTeamFlow";
import JoinTeamFlow from "../../components/common/student/Onboarding/JoinTeamFlow";

import { useAuth } from "../../contexts/AuthContext";
import studentApi from "../../api/handler/endpoints/studentApi";

export default function StudentPage() {
    const { user, updateUser } = useAuth();

    const [checkingTeam, setCheckingTeam] = useState(true);
    const [showGate, setShowGate] = useState(false);
    const [showJoinOrCreate, setShowJoinOrCreate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    useEffect(() => {
        if (user?.teamId) { setCheckingTeam(false); return; }
        studentApi.getMyTeam()
            .then((data) => {
                if (data?.id || data?.teamId) {
                    updateUser({ teamId: data.id ?? data.teamId });
                } else {
                    setShowGate(true);
                }
            })
            .catch(() => setShowGate(true))
            .finally(() => setCheckingTeam(false));
    }, []);

    const handleSkip = () => setShowGate(false);
    const handleCreateOrJoin = () => { setShowGate(false); setShowJoinOrCreate(true); };
    const handleCreate = () => { setShowJoinOrCreate(false); setShowCreate(true); };
    const handleJoin = () => { setShowJoinOrCreate(false); setShowJoin(true); };
    const handleSuccess = (msg) => {
        setShowCreate(false);
        setShowJoin(false);
        setSnack({ open: true, msg });
    };

    if (checkingTeam) return null;

    return (
        <MainLayout>

            <OnboardingGate
                open={showGate}
                onCreateOrJoin={handleCreateOrJoin}
                onSkip={handleSkip}
            />
            <JoinOrCreateModal
                open={showJoinOrCreate}
                onClose={() => setShowJoinOrCreate(false)}
                onCreate={handleCreate}
                onJoin={handleJoin}
            />
            <CreateTeamFlow
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={handleSuccess}
            />
            <JoinTeamFlow
                open={showJoin}
                onClose={() => setShowJoin(false)}
                onSuccess={handleSuccess}
            />

            <Routes>
                <Route index element={<StudentDashboard />} />
                <Route path="team-finder" element={<TeamFinder />} />
                <Route path="kanban" element={<KanbanBoard />} />
                <Route path="files" element={<FileRepository />} />
                <Route path="meetings" element={<StudentMeetings />} />
                <Route path="analytics" element={<StudentAnalytics />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
            </Routes>

            <Snackbar
                open={snack.open}
                autoHideDuration={5000}
                onClose={() => setSnack({ open: false, msg: "" })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>

        </MainLayout>
    );
}
