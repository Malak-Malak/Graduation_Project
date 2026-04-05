// src/layout/MainLayout.jsx

import { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import PhaseBanner from "./PhaseBanner.jsx";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 68;
const TOPBAR_HEIGHT = 64;

export default function MainLayout({ children, onPhaseSwitch }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleMobileToggle = () => setMobileOpen((prev) => !prev);
  const handleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onCollapse={handleCollapse}
        isMobile={isMobile}
        onPhaseSwitch={onPhaseSwitch}
      />

      {/* ── Main area ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          transition: theme.transitions.create("margin-left", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* ── TopBar ── */}
        <TopBar
          height={TOPBAR_HEIGHT}
          onMenuClick={handleMobileToggle}
          isMobile={isMobile}
        />

        {/* ── Phase Banner — ثابت تحت الـ TopBar ── */}
        <PhaseBanner />

        {/* ── Page content ── */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}