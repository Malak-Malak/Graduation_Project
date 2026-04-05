// src/pages/Student/StudentPage.jsx

import { useState, useEffect, useCallback } from "react";
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
import DiscoveryHub from "../../components/common/student/DiscoveryHub/DiscoveryHub";
import Feedback from "../../components/common/student/Feedback/Feedback";
// ← NEW: Phase overlay
import PhaseTransitionOverlay from "../../components/common/shared/PhaseTransitionOverlay";

import { useAuth } from "../../contexts/AuthContext";
import UserProfilePage from "../UserProfile/UserProfilePage";
import studentApi from "../../api/handler/endpoints/studentApi";

// ── session storage keys ──────────────────────────────────────────────────────
const profileDoneKey = (uid) => `gpms_profile_done_${uid}`;
const teamCheckedKey = (uid) => `gpms_team_checked_${uid}`;
const STORE = sessionStorage;

// ─────────────────────────────────────────────────────────────────────────────

export default function StudentPage() {
    const { user, updateUser, currentPhase, setPhase } = useAuth();

    // ── onboarding state ──────────────────────────────────────────────────────
    const [checkingTeam, setCheckingTeam] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [showGate, setShowGate] = useState(false);
    const [showJoinOrCreate, setShowJoinOrCreate] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    // ── phase switching state ─────────────────────────────────────────────────
    const [phaseOverlayOpen, setPhaseOverlayOpen] = useState(false);
    const [pendingPhase, setPendingPhase] = useState(null);   // the phase we are switching TO
    const [phaseSwitching, setPhaseSwitching] = useState(false);

    // ── fetch current version from backend on mount ───────────────────────────
    useEffect(() => {
        studentApi.getCurrentVersion()
            .then((data) => {
                // Backend returns { version: "Phase1" | "Phase2" }
                const version = data?.version ?? data?.Version ?? "Phase1";
                setPhase(version);
            })
            .catch(() => {
                // silently keep whatever is in sessionStorage
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── onboarding: check team on mount ──────────────────────────────────────
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
            .catch(() => {
                !profileDone ? setShowProfile(true) : setShowGate(true);
            })
            .finally(() => setCheckingTeam(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── onboarding handlers ───────────────────────────────────────────────────
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
        setShowCreate(false);
        setShowJoin(false);
        const uid = user?.id ?? user?.userId ?? user?.username;
        if (uid) STORE.removeItem(teamCheckedKey(uid));
        setSnack({ open: true, msg });
    };

    // ── phase switch handler ──────────────────────────────────────────────────
    // Called by Sidebar when the user taps the phase toggle.
    const handlePhaseSwitch = useCallback(async () => {
        if (phaseSwitching) return;

        const targetPhase = currentPhase === "Phase2" ? "Phase1" : "Phase2";

        try {
            setPhaseSwitching(true);

            // 1. Call backend
            await studentApi.switchVersion();

            // 2. Get confirmed version from backend
            //    (some APIs return the new version in the switch response,
            //    so we also try that first before calling getCurrentVersion)
            let confirmedPhase = targetPhase;
            try {
                const versionData = await studentApi.getCurrentVersion();
                confirmedPhase = versionData?.version ?? versionData?.Version ?? targetPhase;
            } catch {
                // use targetPhase as fallback
            }

            // 3. Update context (updates sessionStorage too)
            setPhase(confirmedPhase);

            // 4. Show overlay animation
            setPendingPhase(confirmedPhase);
            setPhaseOverlayOpen(true);

        } catch (err) {
            // Show error snackbar
            const msg = err?.response?.data?.message
                ?? err?.message
                ?? "Failed to switch phase. Please try again.";
            setSnack({ open: true, msg });
        } finally {
            setPhaseSwitching(false);
        }
    }, [currentPhase, phaseSwitching, setPhase]);

    // Called by PhaseTransitionOverlay when animation finishes
    const handleOverlayDone = useCallback(() => {
        setPhaseOverlayOpen(false);
        setPendingPhase(null);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Phase transition overlay — renders above everything */}
            <PhaseTransitionOverlay
                open={phaseOverlayOpen}
                targetPhase={pendingPhase}
                onDone={handleOverlayDone}
            />

            <MainLayout onPhaseSwitch={handlePhaseSwitch}>
                {/* Team-check loading spinner */}
                {checkingTeam && (
                    <Box sx={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.default",
                    }}>
                        <CircularProgress sx={{ color: "#d0895b" }} />
                    </Box>
                )}

                {/* Onboarding modals */}
                <ProfileSetupModal
                    open={!checkingTeam && showProfile}
                    onDone={handleProfileDone}
                />
                <OnboardingGate
                    open={!checkingTeam && !showProfile && showGate}
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

                {/* Routes */}
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
                    <Route path="my-team" element={<MyTeamPage />} />
                    <Route path="*" element={<Navigate to="/student" replace />} />
                    <Route path="feedback" element={<Feedback />} />
                </Routes>

                {/* Snackbar */}
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
        </>
    );
}