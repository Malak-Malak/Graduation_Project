// import { useState } from "react";
// import {
//   Typography,
//   TextField,
//   Button,
//   Stack,
//   Box,
//   Grid,
//   InputAdornment,
//   Paper,
//   Container,
//   Link,
//   Checkbox,
//   FormControlLabel,
//   Divider,
//   Avatar,
//   alpha,
//   useTheme,
//   IconButton,
// } from "@mui/material";

// import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
// import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";


// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import GroupsIcon from "@mui/icons-material/Groups";
// import SearchIcon from "@mui/icons-material/Search";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import TimelineIcon from "@mui/icons-material/Timeline";
// import LoginIcon from "@mui/icons-material/Login";
// import SchoolIcon from "@mui/icons-material/School";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// import { useThemeContext } from "../../contexts/ThemeContext";
// import AuthLayout from "../../layout/AuthLayout/AuthLayout";
// import { loginUser } from "../../features/auth/api/authApi"; // 🔌 جاهز للباك

// const primaryColor = "#d0895b";

// export default function Login() {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";



//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "rememberMe" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (!formData.email || !formData.password) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await loginUser({
//         email: formData.email,
//         password: formData.password,
//       });

//       // 🔐 لاحقًا:
//       // localStorage.setItem("token", res.token);
//       // navigate("/dashboard");

//       console.log("Login success:", res);
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Invalid email or password."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       {/* Background */}
//       <Box
//         sx={{
//           position: "fixed",
//           inset: 0,
//           zIndex: 0,
//           pointerEvents: "none",
//           background: `
//             radial-gradient(circle at 10% 20%, ${alpha(primaryColor, isDark ? 0.12 : 0.08)} 0%, transparent 35%),
//             radial-gradient(circle at 90% 70%, ${alpha(primaryColor, isDark ? 0.1 : 0.06)} 0%, transparent 40%)
//           `,
//         }}
//       />

//       <Container
//         maxWidth="lg"
//         sx={{
//           position: "relative",
//           zIndex: 1,
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//         }}
//       >
//         <Grid container spacing={6} alignItems="center">
//           {/* LEFT SIDE */}
//           <Grid item xs={12} md={6}>
//             <Stack spacing={4}>
//               <Box>
//                 <Typography variant="h2" fontWeight={900}>
//                   Welcome
//                   <Box
//                     component="span"
//                     sx={{ display: "block", color: primaryColor }}
//                   >
//                     Back
//                   </Box>
//                 </Typography>

//                 <Typography
//                   variant="h6"
//                   sx={{ color: primaryColor, mt: 2 }}
//                 >
//                   Sign in to your academic account
//                 </Typography>

//                 <Typography
//                   variant="body1"
//                   color="text.secondary"
//                   sx={{ mt: 2 }}
//                 >
//                   Access your graduation projects, collaborate
//                   with your team, and track progress.
//                 </Typography>
//               </Box>

//               <Grid container spacing={2}>
//                 {[
//                   { icon: GroupsIcon, text: "Team collaboration" },
//                   { icon: SearchIcon, text: "Project resources" },
//                   { icon: AssignmentIcon, text: "Task management" },
//                   { icon: TimelineIcon, text: "Progress tracking" },
//                 ].map((item, index) => (
//                   <Grid item xs={6} key={index}>
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <item.icon sx={{ color: primaryColor }} />
//                       <Typography variant="body2">
//                         {item.text}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>

//               <Box sx={{ display: "flex", gap: 1 }}>
//                 <SchoolIcon sx={{ color: primaryColor }} />
//                 <Typography variant="body2" color="text.secondary">
//                   Palestine Technical University – Faculty of Engineering
//                 </Typography>
//               </Box>
//             </Stack>
//           </Grid>

//           {/* RIGHT SIDE */}
//           <Grid item xs={12} md={6}>
//             <Paper
//               sx={{
//                 p: 5,
//                 borderRadius: 3,
//                 border: `1px solid ${alpha(primaryColor, 0.2)}`,
//               }}
//             >
//               <Stack spacing={3}>
//                 <Box textAlign="center">
//                   <Typography variant="h5" fontWeight={700}>
//                     Account Login
//                   </Typography>
//                 </Box>

//                 <Divider>
//                   <Avatar sx={{ bgcolor: primaryColor }}>
//                     <LoginIcon />
//                   </Avatar>
//                 </Divider>

//                 {error && (
//                   <Typography color="error">{error}</Typography>
//                 )}

//                 <form onSubmit={handleSubmit}>
//                   <Stack spacing={3}>
//                     <TextField
//                       fullWidth
//                       name="email"
//                       label="University Email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <EmailOutlinedIcon />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />

//                     <TextField
//                       fullWidth
//                       name="password"
//                       label="Password"
//                       type={showPassword ? "text" : "password"}
//                       value={formData.password}
//                       onChange={handleChange}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <LockOutlinedIcon />
//                           </InputAdornment>
//                         ),
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <IconButton
//                               onClick={() =>
//                                 setShowPassword(!showPassword)
//                               }
//                             >
//                               {showPassword ? (
//                                 <VisibilityOffOutlinedIcon />
//                               ) : (
//                                 <VisibilityOutlinedIcon />
//                               )}
//                             </IconButton>
//                           </InputAdornment>
//                         ),
//                       }}
//                     />

//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="rememberMe"
//                           checked={formData.rememberMe}
//                           onChange={handleChange}
//                         />
//                       }
//                       label="Remember me"
//                     />

//                     <Button
//                       type="submit"
//                       variant="contained"
//                       size="large"
//                       disabled={loading}
//                       endIcon={<ArrowForwardIcon />}
//                       sx={{
//                         bgcolor: primaryColor,
//                         "&:hover": { bgcolor: "#b06f47" },
//                       }}
//                     >
//                       {loading ? "Signing in..." : "Sign In"}
//                     </Button>
//                   </Stack>
//                 </form>

//                 <Typography textAlign="center">
//                   Don’t have access?{" "}
//                   <Link href="/" underline="hover">
//                     Request access
//                   </Link>
//                 </Typography>
//               </Stack>
//             </Paper>
//           </Grid>
//         </Grid>
//       </Container>
//     </AuthLayout>
//   );
// }
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
      const user = { id: userId, username, role: role?.toLowerCase() };  // ✅ lowercase دايماً

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
// import { useState } from "react";
// import {
//   Typography, TextField, Button, Stack, Box, Grid, InputAdornment,
//   Paper, Container, Link, Checkbox, FormControlLabel, Divider, Avatar,
//   IconButton, alpha, useTheme, CircularProgress, Alert,
// } from "@mui/material";

// import DarkModeOutlinedIcon      from "@mui/icons-material/DarkModeOutlined";
// import LightModeOutlinedIcon     from "@mui/icons-material/LightModeOutlined";
// import PersonOutlinedIcon        from "@mui/icons-material/PersonOutlined";
// import LockOutlinedIcon          from "@mui/icons-material/LockOutlined";
// import VisibilityOutlinedIcon    from "@mui/icons-material/VisibilityOutlined";
// import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import GroupsIcon                from "@mui/icons-material/Groups";
// import SearchIcon                from "@mui/icons-material/Search";
// import AssignmentIcon            from "@mui/icons-material/Assignment";
// import TimelineIcon              from "@mui/icons-material/Timeline";
// import LoginIcon                 from "@mui/icons-material/Login";
// import SchoolIcon                from "@mui/icons-material/School";
// import ArrowForwardIcon          from "@mui/icons-material/ArrowForward";

// import { useNavigate, useLocation }    from "react-router-dom";
// import { useThemeContext }             from "../../contexts/ThemeContext";
// import { useAuth }                    from "../../contexts/AuthContext";
// import { loginUser }                  from "../../api/handler/endpoints/authApi";   // ✅ المسار الصح
// import { validateUsername, validatePassword } from "../../utils/validators";

// const PRIMARY   = "#d0895b";
// const ROLE_HOME = { admin: "/admin", supervisor: "/supervisor", student: "/student" };

// export default function Login() {
//   const theme    = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { mode, toggleMode } = useThemeContext();
//   const { login }            = useAuth();

//   const isDark     = theme.palette.mode === "dark";
//   const titleColor = isDark ? "#EDF2F7" : "#1A202C";
//   const from       = location.state?.from?.pathname ?? null;

//   const [showPw,  setShowPw]  = useState(false);
//   const [form,    setForm]    = useState({ username: "", password: "", rememberMe: false });
//   const [errors,  setErrors]  = useState({ username: null, password: null });
//   const [apiError,setApiError]= useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, checked } = e.target;
//     setForm((p) => ({ ...p, [name]: name === "rememberMe" ? checked : value }));
//     // clear inline error while typing
//     if (name === "username") setErrors((p) => ({ ...p, username: value ? null : p.username }));
//     if (name === "password") setErrors((p) => ({ ...p, password: value ? null : p.password }));
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     if (name === "username") setErrors((p) => ({ ...p, username: validateUsername(value) }));
//     if (name === "password") setErrors((p) => ({ ...p, password: validatePassword(value) }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setApiError(null);

//     const usernameErr = validateUsername(form.username);
//     const passwordErr = validatePassword(form.password);
//     if (usernameErr || passwordErr) {
//       setErrors({ username: usernameErr, password: passwordErr });
//       return;
//     }

//     setLoading(true);
//     try {
//       // ✅ POST /api/Auth/login  { username, password }
//       const res = await loginUser({
//         username: form.username.trim(),
//         password: form.password,
//       });

//       const { token, user } = res.data;
//       login(user, token);

//       const destination =
//         from && from !== "/login"
//           ? from
//           : ROLE_HOME[user?.role?.toLowerCase()] ?? "/";
//       navigate(destination, { replace: true });

//     } catch (err) {
//       const msg = err.response?.data?.message || err.response?.data;
//       setApiError(typeof msg === "string" ? msg : "Invalid username or password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

//       {/* Background blobs */}
//       <Box sx={{
//         position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
//         background: `
//           radial-gradient(circle at 10% 20%, ${alpha(PRIMARY, isDark ? 0.12 : 0.08)} 0%, transparent 35%),
//           radial-gradient(circle at 90% 70%, ${alpha(PRIMARY, isDark ? 0.10 : 0.06)} 0%, transparent 40%)
//         `,
//       }} />

//       {/* Theme toggle */}
//       <IconButton onClick={toggleMode} sx={{ position: "fixed", top: 20, right: 20, zIndex: 10, border: `1px solid ${alpha(PRIMARY, 0.5)}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
//         {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
//       </IconButton>

//       <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
//         <Grid container spacing={6} alignItems="center">

//           {/* ══ LEFT ══ */}
//           <Grid item xs={12} md={6}>
//             <Stack spacing={4}>
//               <Box>
//                 <Typography variant="h2" fontWeight={900} sx={{ color: titleColor, lineHeight: 1.1 }}>Welcome</Typography>
//                 <Typography variant="h2" fontWeight={900} sx={{ color: PRIMARY, lineHeight: 1.1, mt: -0.5 }}>Back</Typography>
//                 <Typography variant="h6" sx={{ color: PRIMARY, mt: 2 }}>Sign in to your academic account</Typography>
//                 <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
//                   Access your graduation projects, collaborate with your team, and track progress.
//                 </Typography>
//               </Box>

//               <Grid container spacing={2}>
//                 {[
//                   { icon: GroupsIcon,     text: "Team collaboration" },
//                   { icon: SearchIcon,     text: "Project resources"  },
//                   { icon: AssignmentIcon, text: "Task management"    },
//                   { icon: TimelineIcon,   text: "Progress tracking"  },
//                 ].map(({ icon: Icon, text }) => (
//                   <Grid item xs={6} key={text}>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <Icon sx={{ color: PRIMARY, fontSize: 20 }} />
//                       <Typography variant="body2" sx={{ color: titleColor }}>{text}</Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>

//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <SchoolIcon sx={{ color: PRIMARY }} />
//                 <Typography variant="body2" color="text.secondary">Palestine Technical University – Faculty of Engineering</Typography>
//               </Box>

//               {/* ✅ Roles hint */}
//               <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PRIMARY, isDark ? 0.06 : 0.03), border: `1px dashed ${alpha(PRIMARY, 0.35)}` }}>
//                 <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: PRIMARY, mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                   Login with your assigned username
//                 </Typography>
//                 {[
//                   { role: "Student",    hint: "Assigned after admin approval" },
//                   { role: "Supervisor", hint: "Department-issued credentials"  },
//                   { role: "Admin",      hint: "System administrator account"  },
//                 ].map(({ role, hint }) => (
//                   <Box key={role} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
//                     <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: PRIMARY, flexShrink: 0 }} />
//                     <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
//                       <strong style={{ color: PRIMARY }}>{role}:</strong> {hint}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </Stack>
//           </Grid>

//           {/* ══ RIGHT ══ */}
//           <Grid item xs={12} md={6}>
//             <Paper sx={{
//               p: 5, borderRadius: 3,
//               border: `1px solid ${alpha(PRIMARY, 0.2)}`,
//               position: "relative", overflow: "hidden",
//               "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${PRIMARY}, #f0a57e, ${PRIMARY})` },
//             }}>
//               <Stack spacing={3}>

//                 <Box textAlign="center">
//                   <Typography variant="h5" fontWeight={700} sx={{ color: titleColor }}>Account Login</Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Use your assigned username and password</Typography>
//                 </Box>

//                 <Divider>
//                   <Avatar sx={{ bgcolor: PRIMARY }}><LoginIcon /></Avatar>
//                 </Divider>

//                 {apiError && <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>{apiError}</Alert>}

//                 <Box component="form" onSubmit={handleSubmit} noValidate>
//                   <Stack spacing={2.5}>

//                     {/* ✅ Username field بدل email */}
//                     <TextField
//                       fullWidth
//                       name="username"
//                       label="Username"
//                       autoComplete="username"
//                       value={form.username}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       error={Boolean(errors.username)}
//                       helperText={errors.username || " "}
//                       placeholder="e.g. student123"
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <PersonOutlinedIcon sx={{ color: errors.username ? "error.main" : PRIMARY, fontSize: 20 }} />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />

//                     {/* Password field */}
//                     <TextField
//                       fullWidth
//                       name="password"
//                       label="Password"
//                       type={showPw ? "text" : "password"}
//                       autoComplete="current-password"
//                       value={form.password}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       error={Boolean(errors.password)}
//                       helperText={errors.password || " "}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <LockOutlinedIcon sx={{ color: errors.password ? "error.main" : PRIMARY, fontSize: 20 }} />
//                           </InputAdornment>
//                         ),
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small">
//                               {showPw ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
//                             </IconButton>
//                           </InputAdornment>
//                         ),
//                       }}
//                     />

//                     <Stack direction="row" justifyContent="space-between" alignItems="center">
//                       <FormControlLabel
//                         control={<Checkbox name="rememberMe" checked={form.rememberMe} onChange={handleChange} size="small" sx={{ color: alpha(PRIMARY, 0.5), "&.Mui-checked": { color: PRIMARY } }} />}
//                         label={<Typography sx={{ fontSize: "0.875rem" }}>Remember me</Typography>}
//                       />
//                       <Link href="#" underline="hover" sx={{ fontSize: "0.8rem", color: PRIMARY }}>Forgot password?</Link>
//                     </Stack>

//                     <Button
//                       type="submit" variant="contained" size="large" fullWidth
//                       disabled={loading}
//                       endIcon={loading ? null : <ArrowForwardIcon />}
//                       sx={{
//                         bgcolor: PRIMARY, height: 48, fontSize: "0.95rem", fontWeight: 600, borderRadius: 2,
//                         boxShadow: `0 8px 20px ${alpha(PRIMARY, 0.35)}`,
//                         "&:hover": { bgcolor: "#b06f47", transform: "translateY(-1px)", boxShadow: `0 12px 24px ${alpha(PRIMARY, 0.45)}` },
//                         "&:disabled": { opacity: 0.7 },
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
//                     </Button>

//                   </Stack>
//                 </Box>

//                 <Typography textAlign="center" sx={{ fontSize: "0.875rem" }} color="text.secondary">
//                   Don&apos;t have access?{" "}
//                   <Link component="button" type="button" onClick={() => navigate("/register")} underline="hover"
//                     sx={{ color: PRIMARY, fontWeight: 600, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: "inherit" }}>
//                     Request access
//                   </Link>
//                 </Typography>

//               </Stack>
//             </Paper>
//           </Grid>

//         </Grid>
//       </Container>
//     </Box>
//   );
// }

// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   InputAdornment,
//   IconButton,
//   Alert,
//   CircularProgress,
//   Divider,
//   Stack,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
// import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

// import { useAuth } from "../../contexts/AuthContext";
// import { useThemeContext } from "../../contexts/ThemeContext";

// // ─── Demo credentials ─────────────────────────────────────────────────────────
// // Remove these and wire to your real API
// const DEMO_USERS = [
//   {
//     email: "admin@ptu.edu.ps",
//     password: "admin123",
//     user: {
//       id: "1",
//       name: "System Admin",
//       email: "admin@ptu.edu.ps",
//       role: "admin",
//     },
//     token: "demo-admin-token",
//   },
//   {
//     email: "supervisor@ptu.edu.ps",
//     password: "super123",
//     user: {
//       id: "2",
//       name: "Dr. Thaer Sammar",
//       email: "supervisor@ptu.edu.ps",
//       role: "supervisor",
//       title: "PhD",
//       department: "Computer Systems Engineering",
//     },
//     token: "demo-supervisor-token",
//   },
//   {
//     email: "student@ptu.edu.ps",
//     password: "student123",
//     user: {
//       id: "3",
//       name: "Aya Abu Ghozeh",
//       email: "student@ptu.edu.ps",
//       role: "student",
//       studentId: "202210321",
//       year: "4th Year",
//       department: "CS",
//       teamName: "EcoTrackers",
//     },
//     token: "demo-student-token",
//   },
// ];

// const ROLE_HOME = {
//   admin: "/admin",
//   supervisor: "/supervisor",
//   student: "/student",
// };

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function LoginPage() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuth();
//   const { mode, toggleMode } = useThemeContext();

//   const t = theme.palette.custom;

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const from = location.state?.from?.pathname ?? null;

//   const validate = () => {
//     if (!email.trim()) return "Email is required.";
//     if (!email.includes("@")) return "Enter a valid email address.";
//     if (!password) return "Password is required.";
//     if (password.length < 6) return "Password must be at least 6 characters.";
//     return null;
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     const validationError = validate();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setLoading(true);

//     // ── Simulate API call ──────────────────────────────────────────────────
//     // Replace this block with your real axios call:
//     // const res = await authService.login({ email, password });
//     await new Promise((r) => setTimeout(r, 900));

//     const match = DEMO_USERS.find(
//       (u) => u.email === email.toLowerCase().trim() && u.password === password
//     );

//     if (!match) {
//       setLoading(false);
//       setError("Invalid email or password. Please try again.");
//       return;
//     }

//     login(match.user, match.token);

//     const destination = from && from !== "/login"
//       ? from
//       : ROLE_HOME[match.user.role];

//     navigate(destination, { replace: true });
//   };

//   // ─── Demo quick-login buttons ──────────────────────────────────────────────
//   const fillDemo = (demoUser) => {
//     setEmail(demoUser.email);
//     setPassword(demoUser.password);
//     setError("");
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         bgcolor: t.bgPrimary,
//         p: 2,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ── Decorative background ── */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           pointerEvents: "none",
//           overflow: "hidden",
//         }}
//       >
//         {/* top-right blob */}
//         <Box
//           sx={{
//             position: "absolute",
//             top: -120,
//             right: -120,
//             width: 420,
//             height: 420,
//             borderRadius: "50%",
//             bgcolor: `${t.accentPrimary}12`,
//           }}
//         />
//         {/* bottom-left blob */}
//         <Box
//           sx={{
//             position: "absolute",
//             bottom: -80,
//             left: -80,
//             width: 300,
//             height: 300,
//             borderRadius: "50%",
//             bgcolor: `${t.accentSecondary}10`,
//           }}
//         />
//         {/* dot grid */}
//         <Box
//           sx={{
//             position: "absolute",
//             inset: 0,
//             backgroundImage: `radial-gradient(${t.borderLight} 1px, transparent 1px)`,
//             backgroundSize: "28px 28px",
//             opacity: 0.6,
//           }}
//         />
//       </Box>

//       {/* ── Theme toggle (top right) ── */}
//       <IconButton
//         onClick={toggleMode}
//         size="small"
//         sx={{
//           position: "absolute",
//           top: 20,
//           right: 20,
//           border: `1px solid ${t.borderLight}`,
//           borderRadius: 2,
//           color: t.textSecondary,
//           bgcolor: t.surfaceCard,
//           zIndex: 1,
//           "&:hover": { bgcolor: t.surfaceHover },
//         }}
//       >
//         {mode === "light" ? (
//           <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
//         ) : (
//           <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
//         )}
//       </IconButton>

//       {/* ── Login card ── */}
//       <Paper
//         elevation={2}
//         sx={{
//           width: "100%",
//           maxWidth: 420,
//           borderRadius: 3,
//           overflow: "hidden",
//           position: "relative",
//           zIndex: 1,
//           bgcolor: t.surfaceCard,
//         }}
//       >
//         {/* Top accent bar */}
//         <Box
//           sx={{
//             height: 4,
//             background: `linear-gradient(90deg, ${t.accentPrimary}, ${t.accentTertiary}, ${t.accentSecondary})`,
//           }}
//         />

//         <Box sx={{ p: { xs: 3, sm: 4 } }}>
//           {/* Header */}
//           <Box sx={{ mb: 4, textAlign: "center" }}>
//             <Box
//               sx={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: 52,
//                 height: 52,
//                 borderRadius: 2.5,
//                 bgcolor: `${t.accentPrimary}18`,
//                 mb: 2,
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontFamily: '"Playfair Display", serif',
//                   fontWeight: 700,
//                   fontSize: "1.1rem",
//                   color: t.accentPrimary,
//                 }}
//               >
//                 GP
//               </Typography>
//             </Box>

//             <Typography
//               variant="h2"
//               sx={{
//                 fontSize: "1.5rem",
//                 fontWeight: 700,
//                 color: t.textPrimary,
//                 mb: 0.5,
//               }}
//             >
//               Welcome back
//             </Typography>
//             <Typography
//               sx={{ fontSize: "0.875rem", color: t.textSecondary }}
//             >
//               Sign in to your GPMS account
//             </Typography>
//           </Box>

//           {/* Error alert */}
//           {error && (
//             <Alert
//               severity="error"
//               sx={{ mb: 2.5, fontSize: "0.82rem", borderRadius: 2 }}
//             >
//               {error}
//             </Alert>
//           )}

//           {/* Form */}
//           <Box component="form" onSubmit={handleLogin} noValidate>
//             <Stack spacing={2}>
//               <TextField
//                 label="Email address"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 fullWidth
//                 autoComplete="email"
//                 autoFocus
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <EmailOutlinedIcon
//                         sx={{ fontSize: 18, color: t.textTertiary }}
//                       />
//                     </InputAdornment>
//                   ),
//                 }}
//               />

//               <TextField
//                 label="Password"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 fullWidth
//                 autoComplete="current-password"
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <LockOutlinedIcon
//                         sx={{ fontSize: 18, color: t.textTertiary }}
//                       />
//                     </InputAdornment>
//                   ),
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         size="small"
//                         onClick={() => setShowPassword((v) => !v)}
//                         edge="end"
//                       >
//                         {showPassword ? (
//                           <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
//                         ) : (
//                           <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
//                         )}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />

//               <Box sx={{ textAlign: "right" }}>
//                 <Typography
//                   sx={{
//                     fontSize: "0.8rem",
//                     color: t.accentPrimary,
//                     cursor: "pointer",
//                     "&:hover": { textDecoration: "underline" },
//                   }}
//                 >
//                   Forgot password?
//                 </Typography>
//               </Box>

//               <Button
//                 type="submit"
//                 variant="contained"
//                 fullWidth
//                 disabled={loading}
//                 sx={{
//                   height: 44,
//                   fontSize: "0.9rem",
//                   fontWeight: 600,
//                   bgcolor: t.accentPrimary,
//                   "&:hover": { bgcolor: theme.palette.primary.dark },
//                   "&:disabled": { opacity: 0.7 },
//                 }}
//               >
//                 {loading ? (
//                   <CircularProgress size={20} sx={{ color: "#fff" }} />
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </Stack>
//           </Box>

//           {/* Demo credentials */}
//           <Divider sx={{ my: 3 }}>
//             <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary, px: 1 }}>
//               DEMO CREDENTIALS
//             </Typography>
//           </Divider>

//           <Stack spacing={1}>
//             {DEMO_USERS.map((du) => (
//               <Button
//                 key={du.user.role}
//                 variant="outlined"
//                 size="small"
//                 fullWidth
//                 onClick={() => fillDemo(du)}
//                 sx={{
//                   borderColor: t.borderLight,
//                   color: t.textSecondary,
//                   fontSize: "0.78rem",
//                   justifyContent: "flex-start",
//                   px: 2,
//                   gap: 1,
//                   "&:hover": {
//                     borderColor: t.accentPrimary,
//                     color: t.accentPrimary,
//                     bgcolor: `${t.accentPrimary}08`,
//                   },
//                 }}
//               >
//                 <Box
//                   sx={{
//                     width: 6,
//                     height: 6,
//                     borderRadius: "50%",
//                     bgcolor:
//                       du.user.role === "admin"
//                         ? t.error
//                         : du.user.role === "supervisor"
//                           ? t.success
//                           : t.accentPrimary,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <Box sx={{ textAlign: "left" }}>
//                   <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
//                     {du.user.role}
//                   </span>{" "}
//                   — {du.email}
//                 </Box>
//               </Button>
//             ))}
//           </Stack>
//         </Box>

//         {/* Footer */}
//         <Box
//           sx={{
//             px: 4,
//             py: 2,
//             bgcolor: t.bgPrimary,
//             borderTop: `1px solid ${t.borderLight}`,
//             textAlign: "center",
//           }}
//         >
//           <Typography sx={{ fontSize: "0.72rem", color: t.textTertiary }}>
//             Palestine Technical University (Kadoorie) · GPMS v1.0
//           </Typography>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }