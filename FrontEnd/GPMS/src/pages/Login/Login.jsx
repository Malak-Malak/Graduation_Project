
import { useState } from "react";
import {
  Typography, TextField, Button, Stack, Box, Grid, InputAdornment,
  Paper, Container, Link, Checkbox, FormControlLabel, Divider, Avatar,
  IconButton, alpha, useTheme, CircularProgress, Alert,
} from "@mui/material";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate, useLocation } from "react-router-dom";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { loginUser } from "../../api/handler/endpoints/authApi";   // ✅ المسار الصح


const PRIMARY = "#d0895b";
const ROLE_HOME = { admin: "/admin", supervisor: "/supervisor", student: "/student" };

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeContext();
  const { login } = useAuth();

  const isDark = theme.palette.mode === "dark";
  const titleColor = isDark ? "#EDF2F7" : "#1A202C";
  const from = location.state?.from?.pathname ?? null;

  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({ username: null, password: null });
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm((p) => ({ ...p, [name]: name === "rememberMe" ? checked : value }));
    // clear inline error while typing
    if (name === "username") setErrors((p) => ({ ...p, username: value ? null : p.username }));
    if (name === "password") setErrors((p) => ({ ...p, password: value ? null : p.password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!form.username.trim()) { setErrors((p) => ({ ...p, username: "Please enter your username." })); return; }
    if (!form.password) { setErrors((p) => ({ ...p, password: "Please enter your password." })); return; }

    setLoading(true);
    try {
      // ✅ POST /api/Auth/login  { username, password }
      const res = await loginUser({
        username: form.username.trim(),
        password: form.password,
      });

      // ✅ الـ response: { role, token, userId, username }
      const { token, role, userId, username } = res.data;

      // نبني الـ user object من الـ response
      const user = { id: userId, username, role: role?.toLowerCase() };

      login(user, token);

      const destination =
        from && from !== "/login"
          ? from
          : ROLE_HOME[role?.toLowerCase()] ?? "/";
      navigate(destination, { replace: true });

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setApiError(typeof msg === "string" ? msg : "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

      {/* Background blobs */}
      <Box sx={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 10% 20%, ${alpha(PRIMARY, isDark ? 0.12 : 0.08)} 0%, transparent 35%),
          radial-gradient(circle at 90% 70%, ${alpha(PRIMARY, isDark ? 0.10 : 0.06)} 0%, transparent 40%)
        `,
      }} />

      {/* Theme toggle */}
      <IconButton onClick={toggleMode} sx={{ position: "fixed", top: 20, right: 20, zIndex: 10, border: `1px solid ${alpha(PRIMARY, 0.5)}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
        <Grid container spacing={6} alignItems="center">

          {/* ══ LEFT ══ */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h2" fontWeight={900} sx={{ color: titleColor, lineHeight: 1.1 }}>Welcome</Typography>
                <Typography variant="h2" fontWeight={900} sx={{ color: PRIMARY, lineHeight: 1.1, mt: -0.5 }}>Back</Typography>
                <Typography variant="h6" sx={{ color: PRIMARY, mt: 2 }}>Sign in to your academic account</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
                  Access your graduation projects, collaborate with your team, and track progress.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {[
                  { icon: GroupsIcon, text: "Team collaboration" },
                  { icon: SearchIcon, text: "Project resources" },
                  { icon: AssignmentIcon, text: "Task management" },
                  { icon: TimelineIcon, text: "Progress tracking" },
                ].map(({ icon: Icon, text }) => (
                  <Grid item xs={6} key={text}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Icon sx={{ color: PRIMARY, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: titleColor }}>{text}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon sx={{ color: PRIMARY }} />
                <Typography variant="body2" color="text.secondary">Palestine Technical University – Faculty of Engineering</Typography>
              </Box>

              {/* ✅ Roles hint */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PRIMARY, isDark ? 0.06 : 0.03), border: `1px dashed ${alpha(PRIMARY, 0.35)}` }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: PRIMARY, mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Login with your assigned username
                </Typography>
                {[
                  { role: "Student", hint: "Assigned after admin approval" },
                  { role: "Supervisor", hint: "Department-issued credentials" },
                  { role: "Admin", hint: "System administrator account" },
                ].map(({ role, hint }) => (
                  <Box key={role} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: PRIMARY, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                      <strong style={{ color: PRIMARY }}>{role}:</strong> {hint}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Grid>

          {/* ══ RIGHT ══ */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 5, borderRadius: 3,
              border: `1px solid ${alpha(PRIMARY, 0.2)}`,
              position: "relative", overflow: "hidden",
              "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${PRIMARY}, #f0a57e, ${PRIMARY})` },
            }}>
              <Stack spacing={3}>

                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={700} sx={{ color: titleColor }}>Account Login</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Use your assigned username and password</Typography>
                </Box>

                <Divider>
                  <Avatar sx={{ bgcolor: PRIMARY }}><LoginIcon /></Avatar>
                </Divider>

                {apiError && <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>{apiError}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack spacing={2.5}>

                    {/* ✅ Username field بدل email */}
                    <TextField
                      fullWidth
                      name="username"
                      label="Username"
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      error={Boolean(errors.username)}
                      helperText={errors.username || " "}
                      placeholder="e.g. student123"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlinedIcon sx={{ color: errors.username ? "error.main" : PRIMARY, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Password field */}
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      error={Boolean(errors.password)}
                      helperText={errors.password || " "}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: errors.password ? "error.main" : PRIMARY, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small">
                              {showPw ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <FormControlLabel
                        control={<Checkbox name="rememberMe" checked={form.rememberMe} onChange={handleChange} size="small" sx={{ color: alpha(PRIMARY, 0.5), "&.Mui-checked": { color: PRIMARY } }} />}
                        label={<Typography sx={{ fontSize: "0.875rem" }}>Remember me</Typography>}
                      />
                      <Link href="#" underline="hover" sx={{ fontSize: "0.8rem", color: PRIMARY }}>Forgot password?</Link>
                    </Stack>

                    <Button
                      type="submit" variant="contained" size="large" fullWidth
                      disabled={loading}
                      endIcon={loading ? null : <ArrowForwardIcon />}
                      sx={{
                        bgcolor: PRIMARY, height: 48, fontSize: "0.95rem", fontWeight: 600, borderRadius: 2,
                        boxShadow: `0 8px 20px ${alpha(PRIMARY, 0.35)}`,
                        "&:hover": { bgcolor: "#b06f47", transform: "translateY(-1px)", boxShadow: `0 12px 24px ${alpha(PRIMARY, 0.45)}` },
                        "&:disabled": { opacity: 0.7 },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
                    </Button>

                  </Stack>
                </Box>

                <Typography textAlign="center" sx={{ fontSize: "0.875rem" }} color="text.secondary">
                  Don&apos;t have access?{" "}
                  <Link component="button" type="button" onClick={() => navigate("/register")} underline="hover"
                    sx={{ color: PRIMARY, fontWeight: 600, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: "inherit" }}>
                    Request access
                  </Link>
                </Typography>

              </Stack>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
