
import { useState } from "react";
import {
  Typography, TextField, Button, Stack, Box, Grid, InputAdornment,
  Paper, Container, Link, Checkbox, FormControlLabel, Divider, Avatar,
  IconButton, alpha, useTheme, CircularProgress, Alert,
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../contexts/ThemeContext";
import { requestAccess } from "../../api/handler/endpoints/authApi";       // ✅ المسار الصح
import { validateRequestAccessEmail } from "../../utils/validators";

const PRIMARY = "#d0895b";

export default function RequestRegister() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeContext();

  const isDark = theme.palette.mode === "dark";
  const titleColor = isDark ? "#EDF2F7" : "#1A202C";

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(validateRequestAccessEmail(e.target.value));
  };

  const handleEmailBlur = () => {
    if (email) setEmailError(validateRequestAccessEmail(email));
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    const emailValidation = validateRequestAccessEmail(email);
    if (emailValidation) { setEmailError(emailValidation); return; }
    if (!agreeToTerms) { setError("You must agree to Terms & Privacy."); return; }

    setLoading(true);
    try {
      // ✅ POST /api/Auth/request-access → يظهر الطلب عند الأدمن
      await requestAccess(email.trim().toLowerCase());
      setMessage("Request submitted! The admin will review and approve your access.");
      setEmail("");
      setEmailError(null);
      setAgreeToTerms(false);
    } catch (err) {
      // 🔍 مؤقت — لنشوف الـ response الحقيقي
      console.log("❌ Status:", err.response?.status);
      console.log("❌ Data:", err.response?.data);

      const data = err.response?.data;
      const msg = typeof data === "string" ? data : data?.message || JSON.stringify(data);
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

      {/* Background blobs */}
      <Box sx={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none",
        background: `
          radial-gradient(circle at 10% 20%, ${alpha(PRIMARY, isDark ? 0.12 : 0.08)} 0%, transparent 35%),
          radial-gradient(circle at 90% 70%, ${alpha(PRIMARY, isDark ? 0.10 : 0.06)} 0%, transparent 40%),
          radial-gradient(circle at 30% 80%, ${alpha(PRIMARY, isDark ? 0.08 : 0.04)} 0%, transparent 30%)
        `,
        "& .blob": { position: "absolute", borderRadius: "50%", background: `radial-gradient(circle, ${alpha(PRIMARY, isDark ? 0.15 : 0.1)} 0%, transparent 70%)`, animation: "floatBlob 25s infinite ease-in-out" },
        "@keyframes floatBlob": { "0%": { transform: "translate(0,0) scale(1)" }, "33%": { transform: "translate(40px,-30px) scale(1.15)" }, "66%": { transform: "translate(-30px,40px) scale(0.9)" }, "100%": { transform: "translate(0,0) scale(1)" } },
      }}>
        <Box className="blob" sx={{ top: "15%", left: "5%", width: 400, height: 400 }} />
        <Box className="blob" sx={{ bottom: "10%", right: "3%", width: 500, height: 500, animationDelay: "-8s" }} />
        <Box className="blob" sx={{ top: "40%", right: "15%", width: 250, height: 250, animationDelay: "-15s" }} />
      </Box>

      {/* Theme toggle */}
      <IconButton onClick={toggleMode} sx={{ position: "fixed", top: 20, right: 20, zIndex: 10, border: `1px solid ${alpha(PRIMARY, 0.5)}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>

      <Container maxWidth={false} sx={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", px: { xs: 4, md: 8, lg: 12 } }}>
        <Grid container spacing={0} alignItems="center" justifyContent="center" sx={{ width: "100%", mx: "auto" }}>

          {/* ══ LEFT ══ */}
          <Grid item xs={12} md={6} sx={{ pr: { md: 8 } }}>
            <Stack spacing={4} sx={{ maxWidth: 550, ml: "auto" }}>

              <Box>
                <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: "3.5rem", md: "4.5rem" }, lineHeight: 1.1, letterSpacing: "-0.02em", color: titleColor }}>
                  Academia
                </Typography>
                <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: "2.8rem", md: "3.8rem" }, lineHeight: 1.1, color: PRIMARY, mt: -0.5 }}>
                  GPMS
                </Typography>
                <Typography variant="h5" fontWeight={600} sx={{ color: PRIMARY, mt: 2, mb: 2 }}>
                  Join the Nexus of Academic Excellence
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Become part of a community of scholars, researchers, and innovators
                  shaping the future through our integrated graduation project management system.
                </Typography>
              </Box>

              {/* Features */}
              <Grid container spacing={2}>
                {[
                  { icon: GroupsIcon, text: "Connect with peers", color: "#2196f3" },
                  { icon: SearchIcon, text: "Find your supervisor", color: "#4caf50" },
                  { icon: AssignmentIcon, text: "Manage your project", color: "#f59e0b" },
                  { icon: TimelineIcon, text: "Track your progress", color: "#e91e63" },
                ].map(({ icon: Icon, text, color }) => (
                  <Grid item xs={6} key={text}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: alpha(color, isDark ? 0.08 : 0.04), border: `1px solid ${alpha(color, isDark ? 0.25 : 0.15)}`, transition: "all 0.3s ease", "&:hover": { transform: "translateX(8px)", bgcolor: alpha(color, isDark ? 0.15 : 0.08), borderColor: color } }}>
                      <Avatar sx={{ bgcolor: color, width: 28, height: 28 }}><Icon sx={{ fontSize: 16, color: "#fff" }} /></Avatar>
                      <Typography variant="body2" fontWeight={600} sx={{ color: titleColor }}>{text}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* University */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PRIMARY, isDark ? 0.08 : 0.03), border: `1px solid ${alpha(PRIMARY, isDark ? 0.2 : 0.1)}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SchoolIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                  <Typography variant="body2" color="text.secondary">
                    Palestine Technical University • Faculty of Engineering
                  </Typography>
                </Box>
              </Box>

              {/* ✅ Email format hint — student only */}
              {/* <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(PRIMARY, isDark ? 0.06 : 0.03), border: `1px dashed ${alpha(PRIMARY, 0.35)}` }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: PRIMARY, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  University Email Format
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", fontFamily: "monospace" }}>
                  student: h.n.awad@students.ptuk.edu.ps
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", fontFamily: "monospace", mt: 0.3 }}>
                  supervisor: h.n.awad@supervisors.ptuk.edu.ps
                </Typography>
              </Box> */}

            </Stack>
          </Grid>

          {/* ══ RIGHT ══ */}
          <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-start" }}>
            <Paper elevation={isDark ? 0 : 3} sx={{
              width: "100%", maxWidth: 600, p: 5, borderRadius: 3,
              bgcolor: isDark ? alpha("#2f3338", 0.95) : "#ffffff",
              backdropFilter: isDark ? "blur(20px)" : "none",
              border: `1px solid ${alpha(PRIMARY, isDark ? 0.25 : 0.15)}`,
              position: "relative", overflow: "hidden",
              boxShadow: isDark ? `0 30px 60px ${alpha(PRIMARY, 0.3)}` : `0 30px 60px ${alpha(PRIMARY, 0.15)}`,
              minHeight: 520, display: "flex", flexDirection: "column", justifyContent: "center",
              "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${PRIMARY}, #f0a57e, ${PRIMARY})` },
            }}>
              <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>

                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: titleColor }}>Portal Access</Typography>
                  <Typography variant="body2" color="text.secondary">Enter your student email to request access</Typography>
                </Box>

                <Divider sx={{ borderColor: alpha(PRIMARY, 0.2) }}>
                  <Avatar sx={{ bgcolor: PRIMARY, width: 32, height: 32 }}>
                    <AutoStoriesIcon sx={{ fontSize: 18, color: "#fff" }} />
                  </Avatar>
                </Divider>

                {error && <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>{message}</Alert>}

                {/* ✅ Email field */}
                <TextField
                  fullWidth
                  label="Student University Email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="h.n.awad@students.ptuk.edu.ps"
                  error={Boolean(emailError)}
                  helperText={emailError || "Must end with @students.ptuk.edu.ps"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: emailError ? "error.main" : PRIMARY }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: isDark ? alpha("#fff", 0.03) : alpha(PRIMARY, 0.02),
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: emailError ? "error.main" : PRIMARY },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: emailError ? "error.main" : PRIMARY },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: emailError ? "error.main" : PRIMARY },
                  }}
                />

                {/* Terms */}
                <FormControlLabel
                  control={<Checkbox checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} size="small" sx={{ color: alpha(PRIMARY, 0.5), "&.Mui-checked": { color: PRIMARY } }} />}
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to{" "}
                      <Link href="#" sx={{ color: PRIMARY, textDecoration: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                        Terms &amp; Privacy
                      </Link>
                    </Typography>
                  }
                />

                {/* Submit */}
                <Button
                  variant="contained" size="large" fullWidth
                  disabled={loading || Boolean(emailError)}
                  onClick={handleSubmit}
                  endIcon={loading ? null : <ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2, py: 2, fontSize: "1.1rem", fontWeight: 700, bgcolor: PRIMARY,
                    boxShadow: `0 10px 20px ${alpha(PRIMARY, 0.3)}`,
                    "&:hover": { bgcolor: "#b06f47", transform: "translateY(-2px)", boxShadow: `0 15px 30px ${alpha(PRIMARY, 0.4)}` },
                    "&:disabled": { opacity: 0.7 },
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Request Access"}
                </Button>

                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have access?{" "}
                    <Link component="button" type="button" onClick={() => navigate("/login")}
                      sx={{ color: PRIMARY, textDecoration: "none", fontWeight: 700, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: "inherit", "&:hover": { textDecoration: "underline" } }}>
                      Sign in here →
                    </Link>
                  </Typography>
                </Box>

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
//   alpha, useTheme, Alert, CircularProgress,
// } from "@mui/material";

// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import GroupsIcon from "@mui/icons-material/Groups";
// import SearchIcon from "@mui/icons-material/Search";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import TimelineIcon from "@mui/icons-material/Timeline";
// import AutoStoriesIcon from "@mui/icons-material/AutoStories";
// import SchoolIcon from "@mui/icons-material/School";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
// import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
// import { IconButton } from "@mui/material";

// import { useNavigate } from "react-router-dom";
// import { useThemeContext } from "../../contexts/ThemeContext";

// // ─── إذا جهزت الـ API uncomment هذا ──────────────────────────────────────────
// // import { sendRegisterRequest } from "../../features/auth/api/authApi";
// // import { validateUniversityEmail } from "../../utils/validators";

// const PRIMARY = "#d0895b";

// const FEATURES = [
//   { icon: GroupsIcon, text: "Connect with peers", color: "#2196f3" },
//   { icon: SearchIcon, text: "Find your supervisor", color: "#4caf50" },
//   { icon: AssignmentIcon, text: "Manage your project", color: "#f59e0b" },
//   { icon: TimelineIcon, text: "Track your progress", color: "#e91e63" },
// ];

// export default function RequestRegister() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const { mode, toggleMode } = useThemeContext();

//   const isDark = theme.palette.mode === "dark";
//   const titleColor = isDark ? "#EDF2F7" : "#1F2937";  // ✅ ثابت

//   const [email, setEmail] = useState("");
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     setError(null);
//     setMessage(null);

//     // Basic email validation
//     if (!email.trim() || !email.includes("@")) {
//       setError("Please enter a valid university email.");
//       return;
//     }
//     if (!agreeToTerms) {
//       setError("You must agree to the Terms & Privacy Policy.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // ── API حقيقي (uncomment لما تكون جاهزة) ─────────────────────────────
//       // const res = await sendRegisterRequest({ email });
//       // setMessage(res.message);

//       // ── Demo mode ─────────────────────────────────────────────────────────
//       await new Promise((r) => setTimeout(r, 900));
//       setMessage("Your access request has been submitted. You will receive an email once approved by the administrator.");
//       setEmail("");
//       setAgreeToTerms(false);
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         bgcolor: theme.palette.background.default,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ── Animated background ── */}
//       <Box
//         sx={{
//           position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
//           overflow: "hidden",
//           background: `
//             radial-gradient(circle at 10% 20%, ${alpha(PRIMARY, isDark ? 0.12 : 0.08)} 0%, transparent 35%),
//             radial-gradient(circle at 90% 70%, ${alpha(PRIMARY, isDark ? 0.10 : 0.06)} 0%, transparent 40%),
//             radial-gradient(circle at 30% 80%, ${alpha(PRIMARY, isDark ? 0.08 : 0.04)} 0%, transparent 30%),
//             radial-gradient(circle at 70% 30%, ${alpha(PRIMARY, isDark ? 0.06 : 0.03)} 0%, transparent 45%)
//           `,
//           "& .blob": {
//             position: "absolute", borderRadius: "50%",
//             background: `radial-gradient(circle, ${alpha(PRIMARY, isDark ? 0.15 : 0.1)} 0%, transparent 70%)`,
//             animation: "floatBlob 25s infinite ease-in-out",
//           },
//           "@keyframes floatBlob": {
//             "0%": { transform: "translate(0,0) scale(1)" },
//             "33%": { transform: "translate(40px,-30px) scale(1.15)" },
//             "66%": { transform: "translate(-30px,40px) scale(0.9)" },
//             "100%": { transform: "translate(0,0) scale(1)" },
//           },
//         }}
//       >
//         <Box className="blob" sx={{ top: "15%", left: "5%", width: 400, height: 400 }} />
//         <Box className="blob" sx={{ bottom: "10%", right: "3%", width: 500, height: 500, animationDelay: "-8s" }} />
//         <Box className="blob" sx={{ top: "40%", right: "15%", width: 250, height: 250, animationDelay: "-15s" }} />
//         <Box className="blob" sx={{ bottom: "30%", left: "10%", width: 300, height: 300, animationDelay: "-5s" }} />
//       </Box>

//       {/* ── Theme toggle ── */}
//       <IconButton
//         onClick={toggleMode}
//         sx={{
//           position: "fixed", top: 20, right: 20, zIndex: 10,
//           border: `1px solid ${alpha(PRIMARY, 0.5)}`, borderRadius: 2,
//           bgcolor: theme.palette.background.paper,
//         }}
//       >
//         {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
//       </IconButton>

//       <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
//         <Grid container spacing={6} alignItems="center">

//           {/* ═══════════════ LEFT ═══════════════ */}
//           <Grid item xs={12} md={6}>
//             <Stack spacing={4} sx={{ maxWidth: 550, ml: "auto" }}>

//               {/* Title — ✅ لون صريح */}
//               <Box>
//                 <Typography
//                   variant="h1" fontWeight={900}
//                   sx={{ fontSize: { xs: "3rem", md: "4rem" }, lineHeight: 1.1, color: titleColor }}
//                 >
//                   Academia
//                 </Typography>
//                 <Typography
//                   variant="h1" fontWeight={900}
//                   sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, lineHeight: 1.1, color: PRIMARY, mt: -0.5 }}
//                 >
//                   GPMS
//                 </Typography>

//                 <Typography variant="h6" fontWeight={600} sx={{ color: PRIMARY, mt: 2 }}>
//                   Join the Nexus of Academic Excellence
//                 </Typography>

//                 <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
//                   Become part of a community of scholars, researchers, and innovators
//                   shaping the future through our integrated graduation project management system.
//                 </Typography>
//               </Box>

//               {/* Features grid */}
//               <Grid container spacing={1.5}>
//                 {FEATURES.map(({ icon: Icon, text, color }) => (
//                   <Grid item xs={6} key={text}>
//                     <Box
//                       sx={{
//                         display: "flex", alignItems: "center", gap: 1.5,
//                         p: 1.5, borderRadius: 2,
//                         bgcolor: alpha(color, isDark ? 0.08 : 0.04),
//                         border: `1px solid ${alpha(color, isDark ? 0.25 : 0.15)}`,
//                         transition: "all 0.25s ease",
//                         "&:hover": {
//                           transform: "translateX(6px)",
//                           bgcolor: alpha(color, isDark ? 0.15 : 0.08),
//                           borderColor: color,
//                         },
//                       }}
//                     >
//                       <Avatar sx={{ bgcolor: color, width: 28, height: 28 }}>
//                         <Icon sx={{ fontSize: 16, color: "#fff" }} />
//                       </Avatar>
//                       <Typography variant="body2" fontWeight={600} sx={{ color: titleColor }}>
//                         {text}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>

//               {/* University info */}
//               <Box
//                 sx={{
//                   display: "flex", alignItems: "center", gap: 1.5, p: 2, borderRadius: 2,
//                   bgcolor: alpha(PRIMARY, isDark ? 0.08 : 0.03),
//                   border: `1px solid ${alpha(PRIMARY, isDark ? 0.2 : 0.1)}`,
//                 }}
//               >
//                 <SchoolIcon sx={{ color: PRIMARY, fontSize: 22 }} />
//                 <Typography variant="body2" color="text.secondary">
//                   Palestine Technical University • Faculty of Engineering
//                 </Typography>
//               </Box>

//             </Stack>
//           </Grid>

//           {/* ═══════════════ RIGHT ═══════════════ */}
//           <Grid item xs={12} md={6}>
//             <Paper
//               elevation={isDark ? 0 : 3}
//               sx={{
//                 width: "100%",
//                 p: { xs: 3, sm: 5 },
//                 borderRadius: 3,
//                 border: `1px solid ${alpha(PRIMARY, isDark ? 0.25 : 0.15)}`,
//                 position: "relative", overflow: "hidden",
//                 bgcolor: isDark ? alpha("#2f3338", 0.95) : "#ffffff",
//                 backdropFilter: isDark ? "blur(20px)" : "none",
//                 boxShadow: isDark
//                   ? `0 30px 60px ${alpha(PRIMARY, 0.25)}`
//                   : `0 20px 50px ${alpha(PRIMARY, 0.12)}`,
//                 "&::before": {
//                   content: '""', position: "absolute",
//                   top: 0, left: 0, right: 0, height: 5,
//                   background: `linear-gradient(90deg, ${PRIMARY}, #f0a57e, ${PRIMARY})`,
//                 },
//               }}
//             >
//               <Stack spacing={3.5}>

//                 {/* Header */}
//                 <Box textAlign="center" sx={{ pt: 1 }}>
//                   <Typography variant="h4" fontWeight={800} sx={{ color: titleColor }}>
//                     Portal Access
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                     Create your academic account to join the ecosystem
//                   </Typography>
//                 </Box>

//                 <Divider sx={{ borderColor: alpha(PRIMARY, 0.2) }}>
//                   <Avatar sx={{ bgcolor: PRIMARY, width: 32, height: 32 }}>
//                     <AutoStoriesIcon sx={{ fontSize: 18, color: "#fff" }} />
//                   </Avatar>
//                 </Divider>

//                 {/* Messages */}
//                 {error && (
//                   <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>
//                     {error}
//                   </Alert>
//                 )}
//                 {message && (
//                   <Alert severity="success" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>
//                     {message}
//                   </Alert>
//                 )}

//                 {/* Email field */}
//                 <TextField
//                   fullWidth
//                   label="University Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="your.name@ptuk.edu.ps"
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <EmailOutlinedIcon sx={{ color: PRIMARY, fontSize: 20 }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: 2,
//                       bgcolor: isDark ? alpha("#fff", 0.03) : alpha(PRIMARY, 0.02),
//                       "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
//                     },
//                     "& .MuiInputLabel-root.Mui-focused": { color: PRIMARY },
//                   }}
//                 />

//                 {/* Terms */}
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={agreeToTerms}
//                       onChange={(e) => setAgreeToTerms(e.target.checked)}
//                       size="small"
//                       sx={{ color: alpha(PRIMARY, 0.5), "&.Mui-checked": { color: PRIMARY } }}
//                     />
//                   }
//                   label={
//                     <Typography variant="body2" color="text.secondary">
//                       I agree to{" "}
//                       <Link href="#" sx={{ color: PRIMARY, textDecoration: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
//                         Terms &amp; Privacy
//                       </Link>
//                     </Typography>
//                   }
//                 />

//                 {/* ✅ Submit button */}
//                 <Button
//                   variant="contained"
//                   size="large"
//                   fullWidth
//                   disabled={loading}
//                   onClick={handleSubmit}
//                   endIcon={loading ? null : <ArrowForwardIcon />}
//                   sx={{
//                     borderRadius: 2, py: 1.6,
//                     fontSize: "1rem", fontWeight: 700,
//                     bgcolor: PRIMARY,
//                     boxShadow: `0 10px 20px ${alpha(PRIMARY, 0.3)}`,
//                     "&:hover": {
//                       bgcolor: "#b06f47",
//                       transform: "translateY(-2px)",
//                       boxShadow: `0 15px 30px ${alpha(PRIMARY, 0.4)}`,
//                     },
//                     "&:disabled": { opacity: 0.7 },
//                     transition: "all 0.25s ease",
//                   }}
//                 >
//                   {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Access Portal"}
//                 </Button>

//                 {/* ✅ Sign in link — navigate بدل href */}
//                 <Typography textAlign="center" variant="body2" color="text.secondary">
//                   Already have access?{" "}
//                   <Link
//                     component="button"
//                     type="button"
//                     onClick={() => navigate("/login")}
//                     sx={{
//                       color: PRIMARY, fontWeight: 700, cursor: "pointer",
//                       textDecoration: "none", background: "none", border: "none",
//                       fontFamily: "inherit", fontSize: "inherit",
//                       "&:hover": { textDecoration: "underline" },
//                     }}
//                   >
//                     Sign in here →
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





