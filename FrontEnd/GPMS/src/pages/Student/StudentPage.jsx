import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Snackbar, Alert, Box, CircularProgress } from "@mui/material";

import MainLayout from "../../layout/MainLayout";
import StudentDashboard from "../../components/common/student/StudentDashboard/StudentDashboard";
import KanbanBoard from "../../components/common/student/KanbanBoard/KanbanBoard";
import FileRepository from "../../components/common/student/FileRepository/FileRepository";
import StudentMeetings from "../../components/common/student/Meetings/StudentMeetings";
import StudentAnalytics from "../../components/common/student/Analytics/StudentAnalytics";
import ProfilePage from "../../components/common/student/Profile/ProfilePage";
import ProjectTimeline from "../../components/common/student/Timeline/ProjectTimeline";

import OnboardingGate from "../../components/common/student/Onboarding/OnboardingGate";
import JoinOrCreateModal from "../../components/common/student/Onboarding/JoinOrCreateModal";
import CreateTeamFlow from "../../components/common/student/Onboarding/CreateTeamFlow";
import JoinTeamFlow from "../../components/common/student/Onboarding/JoinTeamFlow";
import ProfileSetupModal from "../../components/common/student/Profile/ProfileSetupModal";
import MyTeamPage from "../../components/common/student/MyTeam/MyTeamPage";
import { useAuth } from "../../contexts/AuthContext";
import UserProfilePage from "../UserProfile/UserProfilePage";
import studentApi from "../../api/handler/endpoints/studentApi";
import DiscoveryHub from "../../components/common/student/DiscoveryHub/DiscoveryHub";

const profileDoneKey = (uid) => `gpms_profile_done_${uid}`;
const teamCheckedKey = (uid) => `gpms_team_checked_${uid}`;
const STORE = sessionStorage;

export default function StudentPage() {
    const { user, updateUser } = useAuth();

    const [checkingTeam, setCheckingTeam] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [showGate, setShowGate] = useState(false);
    const [showJoinOrCreate, setShowJoinOrCreate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    useEffect(() => {
        const uid = user?.id ?? user?.userId ?? user?.username;
        const profileDone = Boolean(uid && STORE.getItem(profileDoneKey(uid)));
        const alreadyChecked = Boolean(uid && STORE.getItem(teamCheckedKey(uid)));
        if (alreadyChecked) { setCheckingTeam(false); return; }
        if (uid) STORE.setItem(teamCheckedKey(uid), "1");
        if (user?.teamId) { setCheckingTeam(false); return; }
        studentApi.getMyTeam()
            .then((data) => {
                if (data?.id || data?.teamId) {
                    updateUser({ teamId: data.id ?? data.teamId });
                } else {
                    !profileDone ? setShowProfile(true) : setShowGate(true);
                }
            })
            .catch(() => { !profileDone ? setShowProfile(true) : setShowGate(true); })
            .finally(() => setCheckingTeam(false));
    }, []);

    const handleProfileDone = () => {
        const uid = user?.id ?? user?.userId ?? user?.username;
        if (uid) STORE.setItem(profileDoneKey(uid), "1");
        setShowProfile(false);
        setShowGate(true);
    };

    const handleSkip = () => setShowGate(false);
    const handleCreateOrJoin = () => { setShowGate(false); setShowJoinOrCreate(true); };
    const handleCreate = () => { setShowJoinOrCreate(false); setShowCreate(true); };
    const handleJoin = () => { setShowJoinOrCreate(false); setShowJoin(true); };
    const handleSuccess = (msg) => {
        setShowCreate(false); setShowJoin(false);
        const uid = user?.id ?? user?.userId ?? user?.username;
        if (uid) STORE.removeItem(teamCheckedKey(uid));
        setSnack({ open: true, msg });
    };

    return (
        <MainLayout>
            {checkingTeam && (
                <Box sx={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: "background.default"
                }}>
                    <CircularProgress sx={{ color: "#d0895b" }} />
                </Box>
            )}

            <ProfileSetupModal open={!checkingTeam && showProfile} onDone={handleProfileDone} />
            <OnboardingGate open={!checkingTeam && !showProfile && showGate}
                onCreateOrJoin={handleCreateOrJoin} onSkip={handleSkip} />
            <JoinOrCreateModal open={showJoinOrCreate}
                onClose={() => setShowJoinOrCreate(false)}
                onCreate={handleCreate} onJoin={handleJoin} />
            <CreateTeamFlow open={showCreate}
                onClose={() => setShowCreate(false)} onSuccess={handleSuccess} />
            <JoinTeamFlow open={showJoin}
                onClose={() => setShowJoin(false)} onSuccess={handleSuccess} />

            <Routes>
                <Route index element={<StudentDashboard />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="team-finder" element={<DiscoveryHub />} />
                <Route path="kanban" element={<KanbanBoard />} />
                <Route path="files" element={<FileRepository />} />
                <Route path="meetings" element={<StudentMeetings />} />
                <Route path="analytics" element={<StudentAnalytics />} />
                <Route path="timeline" element={<ProjectTimeline />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
                <Route path="my-team" element={<MyTeamPage />} />
            </Routes>

            <Snackbar open={snack.open} autoHideDuration={5000}
                onClose={() => setSnack({ open: false, msg: "" })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity="success" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </MainLayout>
    );
}