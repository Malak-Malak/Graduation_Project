import { useState } from "react";
import {
  Typography, Button, Stack, Box, Grid, Paper, Container, Link,
  Divider, Avatar, alpha, useTheme, Card, CardContent, Chip,
  AppBar, Toolbar, IconButton, Drawer, useMediaQuery, Fade, Zoom,
} from "@mui/material";
import { Fab } from "@mui/material";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../contexts/ThemeContext";

const PRIMARY = "#E59873";        // terracotta — أوضح بالدارك
const PRIMARY_DARK = "#b06f47";   // hover

export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeContext();

  const isDark = mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── ألوان مبنية على الثيم ─────────────────────────────────────────────────
  const bg = isDark ? "#13161C" : "#ffffff";
  const surface = isDark ? "#1E2229" : "#f8f9fa";
  const card = isDark ? "#262C35" : "#ffffff";
  const textMain = isDark ? "#EDF2F7" : "#1F2937";   // ← الحل الرئيسي
  const textSub = isDark ? "#9AAABB" : "#5C6B7E";
  const border = isDark ? alpha(PRIMARY, 0.18) : alpha(PRIMARY, 0.12);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setDrawerOpen(false);
  };

  // ── Mobile drawer ──────────────────────────────────────────────────────────
  const MobileDrawer = (
    <Box sx={{ p: 3, bgcolor: card }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: textMain }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack spacing={2}>
        {["home", "about", "features", "team"].map((s) => (
          <Button
            key={s}
            onClick={() => scrollTo(s)}
            sx={{ justifyContent: "flex-start", textTransform: "capitalize", color: textMain }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
        <Divider sx={{ my: 1, borderColor: border }} />
        <Button
          variant="outlined" fullWidth onClick={() => navigate("/login")}
          sx={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          Sign In
        </Button>
        <Button
          variant="contained" fullWidth onClick={() => navigate("/register")}
          sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK } }}
        >
          Request Access
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: bg, minHeight: "100vh" }}>

      {/* ── Subtle background tint ── */}
      <Box
        sx={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          opacity: isDark ? 0.15 : 0.3,
          background: `
            linear-gradient(135deg, ${alpha(PRIMARY, 0.04)} 0%, transparent 50%),
            linear-gradient(225deg, ${alpha(PRIMARY, 0.04)} 0%, transparent 50%)
          `,
        }}
      />

      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <AppBar
        position="sticky" elevation={0}
        sx={{
          bgcolor: isDark ? alpha("#13161C", 0.97) : alpha("#ffffff", 0.97),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${border}`,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: "space-between", py: 1.5, px: { xs: 0 } }}>
            {/* Logo */}
            <Box
              onClick={() => scrollTo("home")}
              sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            >
              <SchoolIcon sx={{ color: PRIMARY, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600} letterSpacing="-0.5px" sx={{ color: textMain }}>
                <Box component="span" sx={{ color: PRIMARY }}>GPMS</Box>
              </Typography>
            </Box>

            {/* Desktop nav links */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
                {["home", "about", "features", "team"].map((s) => (
                  <Button
                    key={s} onClick={() => scrollTo(s)}
                    sx={{
                      color: textSub, fontWeight: 500, textTransform: "capitalize",
                      "&:hover": { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) }
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right side */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box
                onClick={toggleMode}
                sx={{
                  display: "flex", alignItems: "center", gap: "7px",
                  px: "14px", py: "7px",
                  borderRadius: "20px",
                  border: `1.5px solid ${PRIMARY}`,
                  bgcolor: isDark ? `${alpha(PRIMARY, 0.12)}` : "transparent",
                  color: PRIMARY,
                  fontSize: "0.8125rem", fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: alpha(PRIMARY, 0.1) },
                  userSelect: "none",
                }}
              >
                {isDark ? (
                  <>
                    <DarkModeIcon sx={{ fontSize: 15 }} />
                    Dark
                  </>
                ) : (
                  <>
                    <LightModeIcon sx={{ fontSize: 15 }} />
                    Light
                  </>
                )}
              </Box>

              {!isMobile && (
                <>
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{ color: textSub, fontWeight: 500 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained" onClick={() => navigate("/register")}
                    sx={{
                      bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK },
                      px: 3, borderRadius: "8px", textTransform: "none", fontWeight: 500,
                      color: "#fff",
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: textMain }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: 280, bgcolor: card } }}
      >
        {MobileDrawer}
      </Drawer>

      {/* ══════════════════════ CONTENT ══════════════════════ */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 8 }}>

        {/* ── HERO ── */}
        <Box id="home" sx={{ minHeight: "80vh", display: "flex", alignItems: "center", mb: 12 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip
                    label="PALESTINE TECHNICAL UNIVERSITY"
                    sx={{
                      bgcolor: alpha(PRIMARY, isDark ? 0.15 : 0.08),
                      color: PRIMARY, mb: 4,
                      fontWeight: 500, fontSize: "0.75rem", letterSpacing: "0.5px", borderRadius: "4px",
                    }}
                  />

                  {/* ✅ النص الرئيسي — صريح بالـ color */}
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "2.8rem", md: "3.8rem", lg: "4.5rem" },
                      fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, mb: 3,
                      color: textMain,   // ← الإصلاح الأساسي
                    }}
                  >
                    Graduation Project
                    <Box
                      component="span"
                      sx={{ color: PRIMARY, fontWeight: 600, display: "block" }}
                    >
                      Management System
                    </Box>
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: textSub,
                      fontWeight: 400, maxWidth: 550, mb: 5, lineHeight: 1.7, fontSize: "1.2rem",
                    }}
                  >
                    A centralized platform enhancing communication and workflow management
                    for final-year university projects.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained" size="large" onClick={() => navigate("/register")}
                      sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK },
                        px: 5, py: 1.8, borderRadius: "8px", fontSize: "1rem",
                        fontWeight: 500, textTransform: "none", boxShadow: "none", color: "#fff",
                      }}
                    >
                      Request Access
                    </Button>
                    <Button
                      variant="outlined" size="large" onClick={() => navigate("/login")}
                      sx={{
                        borderColor: alpha(PRIMARY, 0.4), color: textMain,
                        px: 5, py: 1.8, borderRadius: "8px", fontSize: "1rem",
                        fontWeight: 500, textTransform: "none",
                        "&:hover": { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) },
                      }}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={5}>
              <Zoom in timeout={1200}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4, borderRadius: 2,
                    bgcolor: card,
                    border: `1px solid ${border}`,
                  }}
                >
                  <Stack spacing={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Avatar sx={{ bgcolor: PRIMARY, width: 48, height: 48 }}>
                        <SchoolIcon sx={{ color: "#fff" }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ color: textMain }}>
                          GPMS
                        </Typography>
                        <Typography variant="body2" sx={{ color: textSub }}>
                          Academic Year 2025
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: border }} />

                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Typography variant="h3" fontWeight={400} sx={{ color: PRIMARY }}>3</Typography>
                        <Typography variant="body2" sx={{ color: textSub }}>Team Members</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h3" fontWeight={400} sx={{ color: PRIMARY }}>8</Typography>
                        <Typography variant="body2" sx={{ color: textSub }}>Core Features</Typography>
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography variant="body2" sx={{ color: textSub }} gutterBottom>
                        Supervised by
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ color: textMain }}>
                        Thaer Sammar, Ph.D.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>

        {/* ── ABOUT banner ── */}
        <Box
          id="about"
          sx={{
            position: "relative", width: "100vw", height: { xs: 400, md: 450 },
            marginLeft: "calc(-50vw + 50%)", overflow: "hidden", mb: 8,
          }}
        >
          <Box
            sx={{
              position: "absolute", inset: 0,
              backgroundImage: "url(https://images.unsplash.com/photo-1492724441997-5dc865305da7)",
              backgroundSize: "cover", backgroundPosition: "center",
            }}
          />
          <Box
            sx={{
              position: "absolute", inset: 0,
              background: `linear-gradient(90deg, ${alpha("#1a2a3a", 0.95)} 35%, ${alpha("#1a2a3a", 0.75)} 60%, transparent 100%)`,
            }}
          />
          <Box
            sx={{
              position: "relative", zIndex: 1, height: "100%",
              display: "flex", alignItems: "center",
              px: { xs: 3, md: 12 },
            }}
          >
            <Box maxWidth={700}>
              <Typography variant="h3" sx={{ color: "#EDF2F7", mb: 3, fontWeight: 500 }}>
                About GPMS
              </Typography>
              <Typography sx={{ color: alpha("#EDF2F7", 0.85), lineHeight: 1.8 }}>
                GPMS is a web-based Graduation Project Management System designed to enhance
                communication, supervision, and workflow management for final-year university
                projects through centralized task tracking, Kanban boards, structured file
                submission, and real-time notifications.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── University info bar ── */}
        <Box sx={{ mb: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3, borderRadius: 1,
              bgcolor: card,
              border: `1px solid ${border}`,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {[
                { icon: <AccountBalanceIcon />, text: "Palestine Technical University (Kadoorie)" },
                { icon: <MenuBookIcon />, text: "Faculty of Engineering and Technology" },
                { icon: <AutoStoriesIcon />, text: "Computer Systems Engineering" },
              ].map(({ icon, text }) => (
                <Grid item xs={12} md={4} key={text}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: PRIMARY, display: "flex" }}>{icon}</Box>
                    <Typography variant="body2" fontWeight={500} sx={{ color: textMain }}>
                      {text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* ── FEATURES ── */}
        <Box id="features" sx={{ mb: 15 }}>
          <Typography
            variant="h3" fontWeight={500} sx={{ color: textMain }}
            sx={{
              mb: 6, letterSpacing: "-0.5px",
              borderBottom: `2px solid ${alpha(PRIMARY, 0.25)}`,
              pb: 2, display: "inline-block", color: textMain,
            }}
          >
            Core Features
          </Typography>

          <Grid container spacing={3}>
            {[
              { title: "Team Management", desc: "Create and manage project teams" },
              { title: "Supervisor Selection", desc: "View and request supervisors" },
              { title: "Task Board", desc: "Kanban-style task management" },
              { title: "File Submission", desc: "Structured document repository" },
              { title: "Meeting Scheduling", desc: "Book supervisor appointments" },
              { title: "Notifications", desc: "Real-time updates and alerts" },
              { title: "Progress Tracking", desc: "Visual project dashboards" },
              { title: "AI Insights", desc: "Performance recommendations" },
            ].map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    bgcolor: card,
                    border: `1px solid ${border}`,
                    borderRadius: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: PRIMARY,
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 20px ${alpha(PRIMARY, isDark ? 0.15 : 0.1)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: textMain }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSub }}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── TEAM ── */}
        <Box id="team" sx={{ mb: 15 }}>
          <Typography
            variant="h3" fontWeight={500}
            sx={{
              mb: 6, letterSpacing: "-0.5px",
              borderBottom: `2px solid ${alpha(PRIMARY, 0.25)}`,
              pb: 2, display: "inline-block", color: textMain,
            }}
          >
            Developer Team
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {[
              { name: "Aya Abu Ghozeh", id: "202210321", role: "Back End Developer" },
              { name: "Hanan Awad", id: "202210456", role: "Full Stack Developer" },
              { name: "Malak Malak", id: "202210273", role: "Back End Developer" },
            ].map((member) => (
              <Grid item xs={12} md={4} key={member.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4, textAlign: "center",
                    bgcolor: card,
                    border: `1px solid ${border}`,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: PRIMARY,
                      boxShadow: `0 4px 20px ${alpha(PRIMARY, isDark ? 0.15 : 0.08)}`,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100, height: 100, mx: "auto", mb: 2,
                      bgcolor: alpha(PRIMARY, isDark ? 0.2 : 0.1),
                      color: PRIMARY,
                      fontSize: "2.5rem", fontWeight: 300,
                    }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: textMain }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: PRIMARY }} gutterBottom>
                    {member.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSub }} gutterBottom>
                    Computer Systems Engineering
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSub }}>
                    {member.role}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3, bgcolor: card,
                border: `1px solid ${border}`,
                borderRadius: 2, maxWidth: 400, mx: "auto",
              }}
            >
              <Typography variant="body2" sx={{ color: textSub }} gutterBottom>
                Supervised by
              </Typography>
              <Typography variant="h6" fontWeight={500} sx={{ color: PRIMARY }}>
                Thaer Sammar, Ph.D.
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* ── CTA ── */}
        <Box sx={{ mb: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 6, textAlign: "center",
              bgcolor: isDark ? alpha(PRIMARY, 0.05) : alpha(PRIMARY, 0.02),
              border: `1px solid ${border}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" fontWeight={500} gutterBottom
              sx={{ letterSpacing: "-0.5px", color: textMain }}
            >
              Get Started
            </Typography>
            <Typography variant="body1" sx={{ color: textSub, mb: 4, maxWidth: 600, mx: "auto" }}>
              Join the academic platform to manage your graduation project efficiently.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
              <Button
                variant="contained" size="large" onClick={() => navigate("/register")}
                sx={{
                  bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK },
                  px: 5, py: 1.5, borderRadius: "8px", textTransform: "none",
                  fontWeight: 500, color: "#fff",
                }}
              >
                Request Access
              </Button>
              <Button
                variant="outlined" size="large" onClick={() => navigate("/login")}
                sx={{
                  borderColor: alpha(PRIMARY, 0.4), color: textMain,
                  px: 5, py: 1.5, borderRadius: "8px", textTransform: "none", fontWeight: 500,
                  "&:hover": { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* ── FOOTER ── */}
        <Box sx={{ mt: 8 }}>
          <Divider sx={{ mb: 4, borderColor: border }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <SchoolIcon sx={{ color: PRIMARY }} />
                <Typography variant="h6" fontWeight={500} sx={{ color: textMain }}>GPMS</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: textSub, lineHeight: 1.8 }}>
                Graduation Project Management System
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: textMain }}>
                Quick Links
              </Typography>
              <Grid container spacing={1}>
                {["About", "Documentation", "Terms", "Contact"].map((link) => (
                  <Grid item xs={6} key={link}>
                    <Link href="#" underline="hover" sx={{
                      color: textSub, fontSize: "0.9rem",
                      "&:hover": { color: PRIMARY }
                    }}>
                      {link}
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: textMain }}>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ color: textSub }}>
                Palestine Technical University<br />
                Faculty of Engineering<br />
                Computer Systems Engineering
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: border }} />
          <Typography variant="body2" sx={{ color: textSub }} textAlign="center">
            © 2025 GPMS. All rights reserved. Palestine Tulkarm
          </Typography>
        </Box>

      </Container>

      {/* ── FAB ── */}
      <Zoom in>
        <Fab
          size="medium" onClick={() => navigate("/register")}
          sx={{
            position: "fixed", bottom: 24, right: 24,
            bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK },
            display: { xs: "none", md: "flex" },
            color: "#fff",
          }}
        >
          <SchoolIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}