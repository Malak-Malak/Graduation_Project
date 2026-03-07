// import { useState } from "react";
// import {
//   Typography,
//   Button,
//   Stack,
//   Box,
//   Grid,
//   Paper,
//   Container,
//   Link,
//   Divider,
//   Avatar,
//   alpha,
//   useTheme,
//   Card,
//   CardContent,
//   CardActions,
//   Chip,
//   Rating,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   AppBar,
//   Toolbar,
//   IconButton,
//   Drawer,
//   Fab,
//   useMediaQuery,
// } from "@mui/material";

// import MenuIcon from "@mui/icons-material/Menu";
// import CloseIcon from "@mui/icons-material/Close";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// import GroupsIcon from "@mui/icons-material/Groups";
// import SearchIcon from "@mui/icons-material/Search";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import TimelineIcon from "@mui/icons-material/Timeline";
// import AutoStoriesIcon from "@mui/icons-material/AutoStories";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import SchoolIcon from "@mui/icons-material/School";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import ArchitectureIcon from "@mui/icons-material/Architecture";
// import CodeIcon from "@mui/icons-material/Code";
// import StorageIcon from "@mui/icons-material/Storage";
// import SecurityIcon from "@mui/icons-material/Security";
// import SpeedIcon from "@mui/icons-material/Speed";
// import PsychologyIcon from "@mui/icons-material/Psychology";
// import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import DescriptionIcon from "@mui/icons-material/Description";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// const primaryColor = "#d0895b";

// export default function LandingPage() {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === 'dark';
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//     setMobileOpen(false);
//   };

//   // Mobile drawer menu
//   const drawer = (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//         <IconButton onClick={handleDrawerToggle}>
//           <CloseIcon />
//         </IconButton>
//       </Box>
//       <Stack spacing={2}>
//         <Button onClick={() => scrollToSection('abstract')}>Abstract</Button>
//         <Button onClick={() => scrollToSection('features')}>Features</Button>
//         <Button onClick={() => scrollToSection('tech')}>Technology</Button>
//         <Button onClick={() => scrollToSection('team')}>Team</Button>
//         <Divider sx={{ my: 2 }} />
//         <Button 
//           variant="outlined" 
//           fullWidth
//           href="/login"
//           sx={{ borderColor: primaryColor, color: primaryColor }}
//         >
//           Sign In
//         </Button>
//         <Button 
//           variant="contained" 
//           fullWidth
//           href="/request-register"
//           sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#b06f47' } }}
//         >
//           Request Access
//         </Button>
//       </Stack>
//     </Box>
//   );

//   return (
//     <Box sx={{ bgcolor: isDark ? '#121212' : '#fafafa' }}>
//       {/* نفس الخلفية المتحركة من CreateAcademicAccount */}
//       <Box
//         sx={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           zIndex: 0,
//           overflow: "hidden",
//           pointerEvents: "none",
//           background: `
//             radial-gradient(circle at 10% 20%, ${alpha(primaryColor, isDark ? 0.12 : 0.08)} 0%, transparent 35%),
//             radial-gradient(circle at 90% 70%, ${alpha(primaryColor, isDark ? 0.1 : 0.06)} 0%, transparent 40%),
//             radial-gradient(circle at 30% 80%, ${alpha(primaryColor, isDark ? 0.08 : 0.04)} 0%, transparent 30%),
//             radial-gradient(circle at 70% 30%, ${alpha(primaryColor, isDark ? 0.06 : 0.03)} 0%, transparent 45%)
//           `,
//           "& .floating-shape": {
//             position: "absolute",
//             borderRadius: "50%",
//             background: `radial-gradient(circle, ${alpha(primaryColor, isDark ? 0.15 : 0.1)} 0%, transparent 70%)`,
//             animation: "float 25s infinite ease-in-out",
//           },
//           "@keyframes float": {
//             "0%": { transform: "translate(0, 0) scale(1)" },
//             "33%": { transform: "translate(40px, -30px) scale(1.15)" },
//             "66%": { transform: "translate(-30px, 40px) scale(0.9)" },
//             "100%": { transform: "translate(0, 0) scale(1)" },
//           },
//         }}
//       >
//         <Box className="floating-shape" sx={{ top: "15%", left: "5%", width: 400, height: 400 }} />
//         <Box className="floating-shape" sx={{ bottom: "10%", right: "3%", width: 500, height: 500, animationDelay: "-8s" }} />
//         <Box className="floating-shape" sx={{ top: "40%", right: "15%", width: 250, height: 250, animationDelay: "-15s" }} />
//         <Box className="floating-shape" sx={{ bottom: "30%", left: "10%", width: 300, height: 300, animationDelay: "-5s" }} />
//       </Box>

//       {/* Navigation Bar */}
//       <AppBar 
//         position="sticky" 
//         elevation={0}
//         sx={{ 
//           bgcolor: isDark ? alpha('#1e1e1e', 0.95) : alpha('#ffffff', 0.95),
//           backdropFilter: 'blur(20px)',
//           borderBottom: `1px solid ${alpha(primaryColor, 0.1)}`,
//           zIndex: 1100,
//         }}
//       >
//         <Toolbar sx={{ justifyContent: 'space-between' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <SchoolIcon sx={{ color: primaryColor, fontSize: 32 }} />
//             <Typography variant="h6" fontWeight={700}>
//               <Box component="span" sx={{ color: primaryColor }}>GPMS</Box>
//             </Typography>
//           </Box>

//           {!isMobile && (
//             <Box sx={{ display: 'flex', gap: 3 }}>
//               <Button color="inherit" onClick={() => scrollToSection('abstract')}>Abstract</Button>
//               <Button color="inherit" onClick={() => scrollToSection('features')}>Features</Button>
//               <Button color="inherit" onClick={() => scrollToSection('tech')}>Technology</Button>
//               <Button color="inherit" onClick={() => scrollToSection('team')}>Team</Button>
//             </Box>
//           )}

//           <Box sx={{ display: 'flex', gap: 2 }}>
//             {!isMobile && (
//               <>
//                 <Button 
//                   variant="outlined"
//                   href="/login"
//                   sx={{ borderColor: primaryColor, color: primaryColor }}
//                 >
//                   Sign In
//                 </Button>
//                 <Button 
//                   variant="contained"
//                   href="/request-register"
//                   sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#b06f47' } }}
//                 >
//                   Request Access
//                 </Button>
//               </>
//             )}
//             {isMobile && (
//               <IconButton onClick={handleDrawerToggle}>
//                 <MenuIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Mobile Drawer */}
//       <Drawer
//         anchor="right"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           '& .MuiDrawer-paper': { 
//             width: 280,
//             bgcolor: isDark ? '#1e1e1e' : '#ffffff',
//           },
//         }}
//       >
//         {drawer}
//       </Drawer>

//       {/* Main Content */}
//       <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>

//         {/* Hero Section */}
//         <Box sx={{ textAlign: 'center', mb: 12 }}>
//           <Chip 
//             label="🎓 Palestine Technical University - Faculty of Engineering"
//             sx={{ 
//               bgcolor: alpha(primaryColor, 0.1), 
//               color: primaryColor,
//               mb: 3,
//               fontWeight: 600,
//             }}
//           />

//           <Typography 
//             variant="h1" 
//             fontWeight={900} 
//             sx={{ 
//               fontSize: { xs: '3rem', md: '5rem' },
//               lineHeight: 1.1,
//               mb: 2,
//             }}
//           >
//             Graduation Project
//             <Box component="span" sx={{ color: primaryColor, display: 'block' }}>
//               Management System
//             </Box>
//           </Typography>

//           <Typography 
//             variant="h5" 
//             color="text.secondary" 
//             sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
//           >
//             A centralized digital platform enhancing communication, supervision, 
//             and workflow management for final-year university projects.
//           </Typography>

//           <Stack 
//             direction={{ xs: 'column', sm: 'row' }} 
//             spacing={2} 
//             justifyContent="center"
//             sx={{ mb: 8 }}
//           >
//             <Button 
//               variant="contained" 
//               size="large"
//               href="/request-register"
//               endIcon={<ArrowForwardIcon />}
//               sx={{ 
//                 bgcolor: primaryColor, 
//                 '&:hover': { bgcolor: '#b06f47' },
//                 px: 4,
//                 py: 1.5,
//               }}
//             >
//               Request Access
//             </Button>
//             <Button 
//               variant="outlined" 
//               size="large"
//               href="/login"
//               sx={{ 
//                 borderColor: primaryColor, 
//                 color: primaryColor,
//                 px: 4,
//                 py: 1.5,
//               }}
//             >
//               Sign In
//             </Button>
//           </Stack>

//           {/* Project Info Cards */}
//           <Grid container spacing={3} sx={{ mt: 4 }}>
//             <Grid item xs={12} md={4}>
//               <Paper 
//                 sx={{ 
//                   p: 3, 
//                   bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                   border: `1px solid ${alpha(primaryColor, 0.2)}`,
//                 }}
//               >
//                 <Typography variant="h4" fontWeight={700} color={primaryColor}>2025</Typography>
//                 <Typography variant="body2" color="text.secondary">Academic Year</Typography>
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Paper 
//                 sx={{ 
//                   p: 3, 
//                   bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                   border: `1px solid ${alpha(primaryColor, 0.2)}`,
//                 }}
//               >
//                 <Typography variant="h4" fontWeight={700} color={primaryColor}>3</Typography>
//                 <Typography variant="body2" color="text.secondary">Team Members</Typography>
//               </Paper>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Paper 
//                 sx={{ 
//                   p: 3, 
//                   bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                   border: `1px solid ${alpha(primaryColor, 0.2)}`,
//                 }}
//               >
//                 <Typography variant="h4" fontWeight={700} color={primaryColor}>Dr.</Typography>
//                 <Typography variant="body2" color="text.secondary">Supervisor: Thaer Sammar</Typography>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Abstract Section */}
//         <Box id="abstract" sx={{ mb: 12 }}>
//           <Typography variant="h2" fontWeight={800} sx={{ mb: 4, textAlign: 'center' }}>
//             <Box component="span" sx={{ color: primaryColor }}>Project</Box> Abstract
//           </Typography>

//           <Paper 
//             sx={{ 
//               p: 5, 
//               bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//               border: `1px solid ${alpha(primaryColor, 0.2)}`,
//               borderRadius: 3,
//             }}
//           >
//             <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
//               This project presents the development of a web-based Graduation Project Management 
//               System (GPMS) designed to enhance communication, supervision, and workflow management 
//               for final-year university projects. Traditional methods rely heavily on manual 
//               communication and scattered documentation, which often lead to disorganization, 
//               unclear progress tracking, and delays in supervision.
//             </Typography>

//             <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
//               The purpose of this system is to provide a centralized digital platform that allows 
//               students and supervisors to manage tasks, upload files, schedule meetings, track 
//               progress, and communicate effectively. The system was built using modern web 
//               technologies, applying system analysis, database modeling, UI/UX design, and 
//               full-stack implementation.
//             </Typography>
//           </Paper>
//         </Box>

//         {/* Problem Statement */}
//         <Grid container spacing={4} sx={{ mb: 12 }}>
//           <Grid item xs={12} md={6}>
//             <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
//               The <Box component="span" sx={{ color: primaryColor }}>Challenge</Box>
//             </Typography>
//             <Paper sx={{ p: 4, bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff' }}>
//               <List>
//                 {[
//                   "Inefficient Communication via emails and informal messaging",
//                   "Manual Task Tracking leading to disorganization",
//                   "File Management Difficulties across multiple platforms",
//                   "Supervisor Availability Conflicts for meetings",
//                   "Lack of Centralized System for project activities"
//                 ].map((item, index) => (
//                   <ListItem key={index}>
//                     <ListItemIcon>
//                       <CloseIcon sx={{ color: '#f44336' }} />
//                     </ListItemIcon>
//                     <ListItemText primary={item} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Paper>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
//               Our <Box component="span" sx={{ color: primaryColor }}>Solution</Box>
//             </Typography>
//             <Paper sx={{ p: 4, bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff' }}>
//               <List>
//                 {[
//                   "Centralized Dashboard for all project activities",
//                   "Kanban-Based Task Management for clear progress tracking",
//                   "Structured File Repository with version control",
//                   "Supervisor Availability Scheduling System",
//                   "Real-Time Notifications for updates and deadlines"
//                 ].map((item, index) => (
//                   <ListItem key={index}>
//                     <ListItemIcon>
//                       <CheckCircleIcon sx={{ color: '#4caf50' }} />
//                     </ListItemIcon>
//                     <ListItemText primary={item} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Paper>
//           </Grid>
//         </Grid>

//         {/* Features Section */}
//         <Box id="features" sx={{ mb: 12 }}>
//           <Typography variant="h2" fontWeight={800} sx={{ mb: 4, textAlign: 'center' }}>
//             System <Box component="span" sx={{ color: primaryColor }}>Features</Box>
//           </Typography>

//           <Grid container spacing={4}>
//             {[
//               { 
//                 icon: <GroupsIcon sx={{ fontSize: 40 }} />, 
//                 title: "Team Management",
//                 desc: "Create teams, send join requests, and manage team membership",
//                 color: "#2196f3"
//               },
//               { 
//                 icon: <SearchIcon sx={{ fontSize: 40 }} />, 
//                 title: "Supervisor Selection",
//                 desc: "View available supervisors and submit supervision requests",
//                 color: "#4caf50"
//               },
//               { 
//                 icon: <AssignmentIcon sx={{ fontSize: 40 }} />, 
//                 title: "Kanban Task Board",
//                 desc: "Visual task management with drag-and-drop functionality",
//                 color: "#f59e0b"
//               },
//               { 
//                 icon: <UploadFileIcon sx={{ fontSize: 40 }} />, 
//                 title: "File Submission",
//                 desc: "Structured repository for proposals, drafts, and reports",
//                 color: "#e91e63"
//               },
//               { 
//                 icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />, 
//                 title: "Appointment Scheduling",
//                 desc: "Book meetings based on supervisor availability",
//                 color: "#9c27b0"
//               },
//               { 
//                 icon: <NotificationsActiveIcon sx={{ fontSize: 40 }} />, 
//                 title: "Real-Time Notifications",
//                 desc: "Instant alerts for feedback, deadlines, and updates",
//                 color: "#ff5722"
//               },
//               { 
//                 icon: <DashboardIcon sx={{ fontSize: 40 }} />, 
//                 title: "Progress Monitoring",
//                 desc: "Visual dashboards for tracking project advancement",
//                 color: "#00bcd4"
//               },
//               { 
//                 icon: <PsychologyIcon sx={{ fontSize: 40 }} />, 
//                 title: "AI-Powered Insights",
//                 desc: "Intelligent analysis and performance recommendations",
//                 color: "#673ab7"
//               }
//             ].map((feature, index) => (
//               <Grid item xs={12} sm={6} md={3} key={index}>
//                 <Card 
//                   sx={{ 
//                     height: '100%',
//                     bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                     border: `1px solid ${alpha(feature.color, 0.3)}`,
//                     transition: 'transform 0.3s ease',
//                     '&:hover': {
//                       transform: 'translateY(-8px)',
//                       borderColor: feature.color,
//                     }
//                   }}
//                 >
//                   <CardContent>
//                     <Avatar sx={{ bgcolor: feature.color, width: 56, height: 56, mb: 2 }}>
//                       {feature.icon}
//                     </Avatar>
//                     <Typography variant="h6" fontWeight={700} gutterBottom>
//                       {feature.title}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {feature.desc}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Technology Stack */}
//         <Box id="tech" sx={{ mb: 12 }}>
//           <Typography variant="h2" fontWeight={800} sx={{ mb: 4, textAlign: 'center' }}>
//             Technology <Box component="span" sx={{ color: primaryColor }}>Stack</Box>
//           </Typography>

//           <Grid container spacing={4}>
//             <Grid item xs={12} md={4}>
//               <Paper 
//                 sx={{ 
//                   p: 4, 
//                   textAlign: 'center',
//                   bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                 }}
//               >
//                 <CodeIcon sx={{ fontSize: 60, color: primaryColor, mb: 2 }} />
//                 <Typography variant="h5" fontWeight={700} gutterBottom>Frontend</Typography>
//                 <Divider sx={{ my: 2 }} />
//                 <List>
//                   {["React.js", "Material-UI", "Node.js", "Gulp.js", "HTML5/CSS3"].map((item, i) => (
//                     <ListItem key={i}>
//                       <ListItemIcon><CheckCircleIcon sx={{ color: primaryColor, fontSize: 18 }} /></ListItemIcon>
//                       <ListItemText primary={item} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper 
//                 sx={{ 
//                   p: 4, 
//                   textAlign: 'center',
//                   bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                   border: `2px solid ${primaryColor}`,
//                   transform: 'scale(1.05)',
//                 }}
//               >
//                 <StorageIcon sx={{ fontSize: 60, color: primaryColor, mb: 2 }} />
//                 <Typography variant="h5" fontWeight={700} gutterBottom>Backend</Typography>
//                 <Divider sx={{ my: 2 }} />
//                 <List>
//                   {["ASP.NET", "RESTful APIs", "JWT Authentication", "Middleware", "Business Logic"].map((item, i) => (
//                     <ListItem key={i}>
//                       <ListItemIcon><CheckCircleIcon sx={{ color: primaryColor, fontSize: 18 }} /></ListItemIcon>
//                       <ListItemText primary={item} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper 
//                 sx={{ 
//                   p: 4, 
//                   textAlign: 'center',
//                   bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                 }}
//               >
//                 <SecurityIcon sx={{ fontSize: 60, color: primaryColor, mb: 2 }} />
//                 <Typography variant="h5" fontWeight={700} gutterBottom>Database & Tools</Typography>
//                 <Divider sx={{ my: 2 }} />
//                 <List>
//                   {["SQL Server", "Git/GitHub", "AI Integration", "MCP Monitoring", "Activity Logs"].map((item, i) => (
//                     <ListItem key={i}>
//                       <ListItemIcon><CheckCircleIcon sx={{ color: primaryColor, fontSize: 18 }} /></ListItemIcon>
//                       <ListItemText primary={item} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* AI Integration */}
//         <Box sx={{ mb: 12 }}>
//           <Paper 
//             sx={{ 
//               p: 6, 
//               bgcolor: isDark ? alpha('#2f3338', 0.95) : '#ffffff',
//               border: `1px solid ${alpha(primaryColor, 0.3)}`,
//               borderRadius: 4,
//               position: 'relative',
//               overflow: 'hidden',
//             }}
//           >
//             <Box sx={{ position: 'relative', zIndex: 1 }}>
//               <Typography variant="h3" fontWeight={800} gutterBottom>
//                 AI-Powered <Box component="span" sx={{ color: primaryColor }}>Intelligence</Box>
//               </Typography>

//               <Grid container spacing={4} sx={{ mt: 2 }}>
//                 <Grid item xs={12} md={6}>
//                   <Typography variant="h6" gutterBottom sx={{ color: primaryColor }}>
//                     Automated Performance Evaluation
//                   </Typography>
//                   <Typography variant="body1" paragraph>
//                     AI analyzes real-time data to generate progress reports and identify 
//                     at-risk groups through activity logs and submission patterns.
//                   </Typography>

//                   <Typography variant="h6" gutterBottom sx={{ color: primaryColor, mt: 3 }}>
//                     Decision Support System
//                   </Typography>
//                   <Typography variant="body1" paragraph>
//                     Detects delays, low-quality work, or irregular activity, providing 
//                     recommendations for instructor intervention.
//                   </Typography>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography variant="h6" gutterBottom sx={{ color: primaryColor }}>
//                     Smart Notifications
//                   </Typography>
//                   <Typography variant="body1" paragraph>
//                     Sends automated alerts about overdue tasks, file updates, at-risk groups, 
//                     and weekly progress summaries.
//                   </Typography>

//                   <Typography variant="h6" gutterBottom sx={{ color: primaryColor, mt: 3 }}>
//                     Continuous Monitoring
//                   </Typography>
//                   <Typography variant="body1" paragraph>
//                     Tracks submission behavior and task quality in real-time, enabling 
//                     proactive interventions and support.
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Paper>
//         </Box>

//         {/* Team Section */}
//         <Box id="team" sx={{ mb: 12 }}>
//           <Typography variant="h2" fontWeight={800} sx={{ mb: 4, textAlign: 'center' }}>
//             Our <Box component="span" sx={{ color: primaryColor }}>Team</Box>
//           </Typography>

//           <Grid container spacing={4} justifyContent="center">
//             {[
//               { name: "Aya Mohamad Abu_Ghozeh", id: "202210321", role: "Full Stack Developer" },
//               { name: "Hanan Nathmi Awad", id: "202210456", role: "UI/UX Designer" },
//               { name: "Malak Naim Malak", id: "202210273", role: "Backend Developer" },
//             ].map((member, index) => (
//               <Grid item xs={12} md={4} key={index}>
//                 <Card 
//                   sx={{ 
//                     textAlign: 'center',
//                     bgcolor: isDark ? alpha('#2f3338', 0.8) : '#ffffff',
//                   }}
//                 >
//                   <CardContent>
//                     <Avatar 
//                       sx={{ 
//                         width: 120, 
//                         height: 120, 
//                         mx: 'auto', 
//                         mb: 2,
//                         bgcolor: primaryColor,
//                         fontSize: '3rem',
//                       }}
//                     >
//                       {member.name.charAt(0)}
//                     </Avatar>
//                     <Typography variant="h5" fontWeight={700} gutterBottom>
//                       {member.name}
//                     </Typography>
//                     <Typography variant="body2" color="primary" gutterBottom>
//                       {member.id}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       {member.role}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                       Computer Systems Engineering
//                     </Typography>
//                     <Stack direction="row" spacing={1} justifyContent="center">
//                       <IconButton size="small" sx={{ color: primaryColor }}>
//                         <GitHubIcon />
//                       </IconButton>
//                       <IconButton size="small" sx={{ color: primaryColor }}>
//                         <LinkedInIcon />
//                       </IconButton>
//                       <IconButton size="small" sx={{ color: primaryColor }}>
//                         <EmailOutlinedIcon />
//                       </IconButton>
//                     </Stack>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>

//           <Box sx={{ textAlign: 'center', mt: 4 }}>
//             <Typography variant="h5" fontWeight={600} gutterBottom>
//               Supervised by: <Box component="span" sx={{ color: primaryColor }}>Thaer Sammar, Ph.D.</Box>
//             </Typography>
//           </Box>
//         </Box>

//         {/* Call to Action */}
//         <Paper 
//           sx={{ 
//             p: 6, 
//             textAlign: 'center',
//             bgcolor: isDark ? alpha('#2f3338', 0.95) : '#ffffff',
//             border: `1px solid ${alpha(primaryColor, 0.3)}`,
//             borderRadius: 4,
//           }}
//         >
//           <Typography variant="h3" fontWeight={800} gutterBottom>
//             Ready to Get <Box component="span" sx={{ color: primaryColor }}>Started?</Box>
//           </Typography>

//           <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
//             Join the academic ecosystem to manage your graduation journey efficiently.
//           </Typography>

//           <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
//             <Button 
//               variant="contained" 
//               size="large"
//               href="/request-register"
//               endIcon={<ArrowForwardIcon />}
//               sx={{ 
//                 bgcolor: primaryColor, 
//                 '&:hover': { bgcolor: '#b06f47' },
//                 px: 6,
//                 py: 2,
//               }}
//             >
//               Request Account Access
//             </Button>
//             <Button 
//               variant="outlined" 
//               size="large"
//               href="/login"
//               sx={{ 
//                 borderColor: primaryColor, 
//                 color: primaryColor,
//                 px: 6,
//                 py: 2,
//               }}
//             >
//               Sign In to Portal
//             </Button>
//           </Stack>

//           <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
//             Palestine Technical University (Kadoorie) • Faculty of Engineering and Technology
//           </Typography>
//         </Paper>

//         {/* Footer */}
//         <Box sx={{ mt: 8, textAlign: 'center' }}>
//           <Divider sx={{ mb: 4, borderColor: alpha(primaryColor, 0.2) }} />

//           <Grid container spacing={2} justifyContent="center">
//             <Grid item>
//               <Link href="#" underline="hover" sx={{ color: primaryColor }}>About</Link>
//             </Grid>
//             <Grid item>
//               <Link href="#" underline="hover" sx={{ color: primaryColor }}>Documentation</Link>
//             </Grid>
//             <Grid item>
//               <Link href="#" underline="hover" sx={{ color: primaryColor }}>Terms</Link>
//             </Grid>
//             <Grid item>
//               <Link href="#" underline="hover" sx={{ color: primaryColor }}>Privacy</Link>
//             </Grid>
//             <Grid item>
//               <Link href="#" underline="hover" sx={{ color: primaryColor }}>Contact</Link>
//             </Grid>
//           </Grid>

//           <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
//             © 2025 Graduation Project Management System (GPMS). All rights reserved.
//           </Typography>
//           <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
//             Computer Systems Engineering Department • Palestine Tulkarm
//           </Typography>
//         </Box>
//       </Container>

//       {/* Floating Action Button for quick access */}
//       <Fab 
//         variant="extended"
//         sx={{ 
//           position: 'fixed', 
//           bottom: 24, 
//           right: 24, 
//           bgcolor: primaryColor,
//           '&:hover': { bgcolor: '#b06f47' },
//           display: { xs: 'none', md: 'flex' },
//         }}
//         href="/request-register"
//       >
//         <SchoolIcon sx={{ mr: 1 }} />
//         Request Access
//       </Fab>
//     </Box>
//   );
// }



// import { useState } from "react";
// import {
//   Typography,
//   Button,
//   Stack,
//   Box,
//   Grid,
//   Paper,
//   Container,
//   Link,
//   Divider,
//   Avatar,
//   alpha,
//   useTheme,
//   Card,
//   CardContent,
//   Chip,
//   AppBar,
//   Toolbar,
//   IconButton,
//   Drawer,
//   useMediaQuery,
//   Fade,
//   Zoom,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
// } from "@mui/material";

// import MenuIcon from "@mui/icons-material/Menu";
// import CloseIcon from "@mui/icons-material/Close";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import GroupsIcon from "@mui/icons-material/Groups";
// import SearchIcon from "@mui/icons-material/Search";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import TimelineIcon from "@mui/icons-material/Timeline";
// import SchoolIcon from "@mui/icons-material/School";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CodeIcon from "@mui/icons-material/Code";
// import StorageIcon from "@mui/icons-material/Storage";
// import SecurityIcon from "@mui/icons-material/Security";
// import PsychologyIcon from "@mui/icons-material/Psychology";
// import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import DescriptionIcon from "@mui/icons-material/Description";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import AutoStoriesIcon from "@mui/icons-material/AutoStories";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";
// import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import StarIcon from "@mui/icons-material/Star";
// import { Fab } from "@mui/material";
// const primaryColor = "#d0895b";

// export default function LandingPage() {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === 'dark';
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//     setMobileOpen(false);
//   };

//   const drawer = (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//         <IconButton onClick={handleDrawerToggle}>
//           <CloseIcon />
//         </IconButton>
//       </Box>
//       <Stack spacing={2}>
//         <Button onClick={() => scrollToSection('home')}>Home</Button>
//         <Button onClick={() => scrollToSection('overview')}>Overview</Button>
//         <Button onClick={() => scrollToSection('features')}>Features</Button>
//         <Button onClick={() => scrollToSection('technology')}>Technology</Button>
//         <Button onClick={() => scrollToSection('team')}>Team</Button>
//         <Divider sx={{ my: 2 }} />
//         <Button 
//           variant="outlined" 
//           fullWidth
//           href="/login"
//           sx={{ borderColor: primaryColor, color: primaryColor }}
//         >
//           Sign In
//         </Button>
//         <Button 
//           variant="contained" 
//           fullWidth
//           href="/request-register"
//           sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#b06f47' } }}
//         >
//           Request Access
//         </Button>
//       </Stack>
//     </Box>
//   );

//   return (
//     <Box sx={{ 
//       bgcolor: isDark ? '#0a0a0a' : '#f8f9fa',
//       minHeight: '100vh',
//     }}>
//       {/* Background Pattern */}
//       <Box
//         sx={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           zIndex: 0,
//           overflow: "hidden",
//           pointerEvents: "none",
//           background: `
//             radial-gradient(circle at 20% 30%, ${alpha(primaryColor, isDark ? 0.08 : 0.05)} 0%, transparent 40%),
//             radial-gradient(circle at 80% 70%, ${alpha(primaryColor, isDark ? 0.06 : 0.03)} 0%, transparent 50%),
//             radial-gradient(circle at 40% 80%, ${alpha(primaryColor, isDark ? 0.04 : 0.02)} 0%, transparent 30%),
//             radial-gradient(circle at 70% 20%, ${alpha(primaryColor, isDark ? 0.05 : 0.03)} 0%, transparent 45%)
//           `,
//         }}
//       />

//       {/* Navigation */}
//       <AppBar 
//         position="sticky" 
//         elevation={0}
//         sx={{ 
//           bgcolor: isDark ? alpha('#0a0a0a', 0.95) : alpha('#ffffff', 0.95),
//           backdropFilter: 'blur(20px)',
//           borderBottom: `1px solid ${alpha(primaryColor, 0.1)}`,
//           zIndex: 1100,
//         }}
//       >
//         <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//             <Avatar sx={{ bgcolor: primaryColor, width: 40, height: 40 }}>
//               <SchoolIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
//                 <Box component="span" sx={{ color: primaryColor }}>GPMS</Box>
//               </Typography>
//               <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
//                 Graduation Project Management System
//               </Typography>
//             </Box>
//           </Box>

//           {!isMobile && (
//             <Box sx={{ display: 'flex', gap: 4 }}>
//               <Button color="inherit" onClick={() => scrollToSection('home')}>Home</Button>
//               <Button color="inherit" onClick={() => scrollToSection('overview')}>Overview</Button>
//               <Button color="inherit" onClick={() => scrollToSection('features')}>Features</Button>
//               <Button color="inherit" onClick={() => scrollToSection('technology')}>Technology</Button>
//               <Button color="inherit" onClick={() => scrollToSection('team')}>Team</Button>
//             </Box>
//           )}

//           <Box sx={{ display: 'flex', gap: 2 }}>
//             {!isMobile && (
//               <>
//                 <Button 
//                   variant="outlined"
//                   href="/login"
//                   sx={{ 
//                     borderColor: alpha(primaryColor, 0.5),
//                     color: primaryColor,
//                     '&:hover': { borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.04) }
//                   }}
//                 >
//                   Sign In
//                 </Button>
//                 <Button 
//                   variant="contained"
//                   href="/request-register"
//                   endIcon={<ArrowForwardIcon />}
//                   sx={{ 
//                     bgcolor: primaryColor, 
//                     '&:hover': { bgcolor: '#b06f47' },
//                     boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
//                   }}
//                 >
//                   Get Started
//                 </Button>
//               </>
//             )}
//             {isMobile && (
//               <IconButton onClick={handleDrawerToggle}>
//                 <MenuIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer
//         anchor="right"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           '& .MuiDrawer-paper': { 
//             width: 300,
//             bgcolor: isDark ? '#1a1a1a' : '#ffffff',
//           },
//         }}
//       >
//         {drawer}
//       </Drawer>

//       {/* Main Content */}
//       <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 6 }}>

//         {/* Hero Section */}
//         <Box id="home" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', mb: 8 }}>
//           <Grid container spacing={6} alignItems="center">
//             <Grid item xs={12} md={7}>
//               <Fade in timeout={1000}>
//                 <Box>
//                   <Chip 
//                     label="🎓 Palestine Technical University - Faculty of Engineering"
//                     sx={{ 
//                       bgcolor: alpha(primaryColor, 0.1), 
//                       color: primaryColor,
//                       mb: 3,
//                       fontWeight: 600,
//                       borderRadius: '20px',
//                       px: 2,
//                     }}
//                   />

//                   <Typography 
//                     variant="h1" 
//                     fontWeight={900} 
//                     sx={{ 
//                       fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
//                       lineHeight: 1.1,
//                       mb: 2,
//                     }}
//                   >
//                     Graduation Project
//                     <Box component="span" sx={{ color: primaryColor, display: 'block' }}>
//                       Management System
//                     </Box>
//                   </Typography>

//                   <Typography 
//                     variant="h6" 
//                     color="text.secondary" 
//                     sx={{ maxWidth: 600, mb: 4, lineHeight: 1.8 }}
//                   >
//                     A centralized digital platform enhancing communication, supervision, 
//                     and workflow management for final-year university projects.
//                   </Typography>

//                   <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
//                     <Button 
//                       variant="contained" 
//                       size="large"
//                       href="/request-register"
//                       endIcon={<RocketLaunchIcon />}
//                       sx={{ 
//                         bgcolor: primaryColor, 
//                         '&:hover': { bgcolor: '#b06f47' },
//                         px: 4,
//                         py: 1.8,
//                         borderRadius: '12px',
//                         fontSize: '1.1rem',
//                         fontWeight: 700,
//                       }}
//                     >
//                       Request Access
//                     </Button>
//                     <Button 
//                       variant="outlined" 
//                       size="large"
//                       href="/login"
//                       sx={{ 
//                         borderColor: alpha(primaryColor, 0.5), 
//                         color: primaryColor,
//                         px: 4,
//                         py: 1.8,
//                         borderRadius: '12px',
//                         fontSize: '1.1rem',
//                         fontWeight: 600,
//                       }}
//                     >
//                       Sign In
//                     </Button>
//                   </Stack>
//                 </Box>
//               </Fade>
//             </Grid>

//             <Grid item xs={12} md={5}>
//               <Zoom in timeout={1200}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                     borderRadius: 4,
//                     border: `1px solid ${alpha(primaryColor, 0.2)}`,
//                     backdropFilter: 'blur(10px)',
//                   }}
//                 >
//                   <Stack spacing={3}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                       <Avatar sx={{ bgcolor: primaryColor, width: 56, height: 56 }}>
//                         <SchoolIcon sx={{ fontSize: 30 }} />
//                       </Avatar>
//                       <Box>
//                         <Typography variant="h5" fontWeight={800}>GPMS v1.0</Typography>
//                         <Typography variant="body2" color="text.secondary">Academic Year 2025</Typography>
//                       </Box>
//                     </Box>

//                     <Divider sx={{ borderColor: alpha(primaryColor, 0.2) }} />

//                     <Grid container spacing={2}>
//                       <Grid item xs={6}>
//                         <Box sx={{ textAlign: 'center', p: 2 }}>
//                           <Typography variant="h4" fontWeight={800} color={primaryColor}>3</Typography>
//                           <Typography variant="body2">Team Members</Typography>
//                         </Box>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Box sx={{ textAlign: 'center', p: 2 }}>
//                           <Typography variant="h4" fontWeight={800} color={primaryColor}>8+</Typography>
//                           <Typography variant="body2">Core Features</Typography>
//                         </Box>
//                       </Grid>
//                     </Grid>

//                     <Box sx={{ bgcolor: alpha(primaryColor, 0.05), p: 2, borderRadius: 2 }}>
//                       <Typography variant="body2" fontWeight={600} gutterBottom>
//                         Supervised by:
//                       </Typography>
//                       <Typography variant="body1" fontWeight={700}>
//                         Thaer Sammar, Ph.D.
//                       </Typography>
//                     </Box>
//                   </Stack>
//                 </Paper>
//               </Zoom>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* University Info Bar */}
//         <Box sx={{ mb: 8 }}>
//           <Paper
//             sx={{
//               p: 2,
//               bgcolor: isDark ? alpha('#1e1e1e', 0.6) : '#ffffff',
//               borderRadius: 3,
//               border: `1px solid ${alpha(primaryColor, 0.15)}`,
//             }}
//           >
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <AccountBalanceIcon sx={{ color: primaryColor }} />
//                   <Typography variant="body1" fontWeight={600}>
//                     Palestine Technical University (Kadoorie)
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <MenuBookIcon sx={{ color: primaryColor }} />
//                   <Typography variant="body1" fontWeight={600}>
//                     Faculty of Engineering and Technology
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <AutoStoriesIcon sx={{ color: primaryColor }} />
//                   <Typography variant="body1" fontWeight={600}>
//                     Computer Systems Engineering Department
//                   </Typography>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Paper>
//         </Box>

//         {/* Abstract/Overview Section */}
//         <Box id="overview" sx={{ mb: 10 }}>
//           <Typography 
//             variant="h2" 
//             fontWeight={800} 
//             sx={{ 
//               mb: 6, 
//               textAlign: 'center',
//               position: 'relative',
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 bottom: -16,
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 width: 80,
//                 height: 4,
//                 bgcolor: primaryColor,
//                 borderRadius: 2,
//               }
//             }}
//           >
//             Project <Box component="span" sx={{ color: primaryColor }}>Overview</Box>
//           </Typography>

//           <Grid container spacing={4}>
//             <Grid item xs={12} md={6}>
//               <Card 
//                 sx={{ 
//                   height: '100%',
//                   bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                   borderRadius: 4,
//                   transition: 'transform 0.3s ease',
//                   '&:hover': { transform: 'translateY(-8px)' },
//                 }}
//               >
//                 <CardContent sx={{ p: 4 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//                     <Avatar sx={{ bgcolor: primaryColor, width: 48, height: 48 }}>
//                       <DescriptionIcon />
//                     </Avatar>
//                     <Typography variant="h5" fontWeight={700}>Abstract</Typography>
//                   </Box>

//                   <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
//                     This project presents the development of a web-based Graduation Project Management 
//                     System (GPMS) designed to enhance communication, supervision, and workflow management 
//                     for final-year university projects. Traditional methods rely heavily on manual 
//                     communication and scattered documentation, which often lead to disorganization, 
//                     unclear progress tracking, and delays in supervision.
//                   </Typography>

//                   <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
//                     The purpose of this system is to provide a centralized digital platform that allows 
//                     students and supervisors to manage tasks, upload files, schedule meetings, track 
//                     progress, and communicate effectively.
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Card 
//                 sx={{ 
//                   height: '100%',
//                   bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                   borderRadius: 4,
//                   transition: 'transform 0.3s ease',
//                   '&:hover': { transform: 'translateY(-8px)' },
//                 }}
//               >
//                 <CardContent sx={{ p: 4 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//                     <Avatar sx={{ bgcolor: primaryColor, width: 48, height: 48 }}>
//                       <LightbulbIcon />
//                     </Avatar>
//                     <Typography variant="h5" fontWeight={700}>Objectives</Typography>
//                   </Box>

//                   <List sx={{ width: '100%' }}>
//                     {[
//                       "Enhance communication between students and supervisors",
//                       "Provide structured task management with Kanban boards",
//                       "Centralize file submission and feedback processes",
//                       "Streamline appointment scheduling with supervisor availability",
//                       "Integrate AI-powered performance monitoring and alerts"
//                     ].map((item, index) => (
//                       <ListItem key={index} sx={{ px: 0 }}>
//                         <ListItemIcon sx={{ minWidth: 36 }}>
//                           <CheckCircleIcon sx={{ color: primaryColor, fontSize: 20 }} />
//                         </ListItemIcon>
//                         <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Problem & Solution Cards */}
//         <Grid container spacing={4} sx={{ mb: 10 }}>
//           <Grid item xs={12} md={6}>
//             <Card 
//               sx={{ 
//                 bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                 borderRadius: 4,
//                 border: `1px solid ${alpha('#f44336', 0.3)}`,
//               }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//                   <Avatar sx={{ bgcolor: '#f44336', width: 48, height: 48 }}>
//                     <CloseIcon />
//                   </Avatar>
//                   <Typography variant="h5" fontWeight={700}>Challenges</Typography>
//                 </Box>

//                 <List>
//                   {[
//                     "Inefficient Communication via emails and informal messaging",
//                     "Manual Task Tracking leading to disorganization",
//                     "File Management Difficulties across multiple platforms",
//                     "Supervisor Availability Conflicts for meetings",
//                     "Lack of Centralized System for project activities"
//                   ].map((item, index) => (
//                     <ListItem key={index} sx={{ px: 0 }}>
//                       <ListItemIcon sx={{ minWidth: 36 }}>
//                         <Box sx={{ 
//                           width: 20, 
//                           height: 20, 
//                           borderRadius: '50%', 
//                           bgcolor: alpha('#f44336', 0.2),
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                         }}>
//                           <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
//                         </Box>
//                       </ListItemIcon>
//                       <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Card 
//               sx={{ 
//                 bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                 borderRadius: 4,
//                 border: `1px solid ${alpha('#4caf50', 0.3)}`,
//               }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//                   <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
//                     <CheckCircleIcon />
//                   </Avatar>
//                   <Typography variant="h5" fontWeight={700}>Solutions</Typography>
//                 </Box>

//                 <List>
//                   {[
//                     "Centralized Dashboard for all project activities",
//                     "Kanban-Based Task Management for clear progress tracking",
//                     "Structured File Repository with version control",
//                     "Supervisor Availability Scheduling System",
//                     "Real-Time Notifications for updates and deadlines"
//                   ].map((item, index) => (
//                     <ListItem key={index} sx={{ px: 0 }}>
//                       <ListItemIcon sx={{ minWidth: 36 }}>
//                         <Box sx={{ 
//                           width: 20, 
//                           height: 20, 
//                           borderRadius: '50%', 
//                           bgcolor: alpha('#4caf50', 0.2),
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                         }}>
//                           <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
//                         </Box>
//                       </ListItemIcon>
//                       <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>

//         {/* Features Section */}
//         <Box id="features" sx={{ mb: 10 }}>
//           <Typography 
//             variant="h2" 
//             fontWeight={800} 
//             sx={{ 
//               mb: 6, 
//               textAlign: 'center',
//               position: 'relative',
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 bottom: -16,
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 width: 80,
//                 height: 4,
//                 bgcolor: primaryColor,
//                 borderRadius: 2,
//               }
//             }}
//           >
//             Core <Box component="span" sx={{ color: primaryColor }}>Features</Box>
//           </Typography>

//           <Grid container spacing={3}>
//             {[
//               { 
//                 icon: <GroupsIcon />, 
//                 title: "Team Management",
//                 desc: "Create teams, send join requests, and manage team membership",
//                 color: "#2196f3"
//               },
//               { 
//                 icon: <SearchIcon />, 
//                 title: "Supervisor Selection",
//                 desc: "View available supervisors and submit supervision requests",
//                 color: "#4caf50"
//               },
//               { 
//                 icon: <AssignmentIcon />, 
//                 title: "Kanban Task Board",
//                 desc: "Visual task management with drag-and-drop functionality",
//                 color: "#f59e0b"
//               },
//               { 
//                 icon: <UploadFileIcon />, 
//                 title: "File Submission",
//                 desc: "Structured repository for proposals, drafts, and reports",
//                 color: "#e91e63"
//               },
//               { 
//                 icon: <CalendarMonthIcon />, 
//                 title: "Appointment Scheduling",
//                 desc: "Book meetings based on supervisor availability",
//                 color: "#9c27b0"
//               },
//               { 
//                 icon: <NotificationsActiveIcon />, 
//                 title: "Real-Time Notifications",
//                 desc: "Instant alerts for feedback, deadlines, and updates",
//                 color: "#ff5722"
//               },
//               { 
//                 icon: <DashboardIcon />, 
//                 title: "Progress Monitoring",
//                 desc: "Visual dashboards for tracking project advancement",
//                 color: "#00bcd4"
//               },
//               { 
//                 icon: <PsychologyIcon />, 
//                 title: "AI-Powered Insights",
//                 desc: "Intelligent analysis and performance recommendations",
//                 color: "#673ab7"
//               }
//             ].map((feature, index) => (
//               <Grid item xs={12} sm={6} md={3} key={index}>
//                 <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
//                   <Card 
//                     sx={{ 
//                       height: '100%',
//                       bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                       borderRadius: 3,
//                       transition: 'all 0.3s ease',
//                       '&:hover': {
//                         transform: 'translateY(-8px)',
//                         boxShadow: `0 12px 24px ${alpha(feature.color, 0.2)}`,
//                       }
//                     }}
//                   >
//                     <CardContent sx={{ p: 3 }}>
//                       <Avatar 
//                         sx={{ 
//                           bgcolor: alpha(feature.color, 0.1),
//                           color: feature.color,
//                           width: 56,
//                           height: 56,
//                           mb: 2,
//                         }}
//                       >
//                         {feature.icon}
//                       </Avatar>
//                       <Typography variant="h6" fontWeight={700} gutterBottom>
//                         {feature.title}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
//                         {feature.desc}
//                       </Typography>
//                     </CardContent>
//                   </Card>
//                 </Zoom>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Technology Stack */}
//         <Box id="technology" sx={{ mb: 10 }}>
//           <Typography 
//             variant="h2" 
//             fontWeight={800} 
//             sx={{ 
//               mb: 6, 
//               textAlign: 'center',
//               position: 'relative',
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 bottom: -16,
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 width: 80,
//                 height: 4,
//                 bgcolor: primaryColor,
//                 borderRadius: 2,
//               }
//             }}
//           >
//             Technology <Box component="span" sx={{ color: primaryColor }}>Stack</Box>
//           </Typography>

//           <Grid container spacing={4}>
//             {[
//               {
//                 title: "Frontend",
//                 icon: <CodeIcon sx={{ fontSize: 40 }} />,
//                 items: ["React.js", "Material-UI", "Node.js", "Gulp.js", "HTML5/CSS3"],
//                 color: "#2196f3"
//               },
//               {
//                 title: "Backend",
//                 icon: <StorageIcon sx={{ fontSize: 40 }} />,
//                 items: ["ASP.NET", "RESTful APIs", "JWT Authentication", "Middleware", "Business Logic"],
//                 color: "#4caf50"
//               },
//               {
//                 title: "Database & Tools",
//                 icon: <SecurityIcon sx={{ fontSize: 40 }} />,
//                 items: ["SQL Server", "Git/GitHub", "AI Integration", "MCP Monitoring", "Activity Logs"],
//                 color: "#f59e0b"
//               }
//             ].map((tech, index) => (
//               <Grid item xs={12} md={4} key={index}>
//                 <Card 
//                   sx={{ 
//                     height: '100%',
//                     bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                     borderRadius: 4,
//                     border: `1px solid ${alpha(tech.color, 0.2)}`,
//                     transition: 'transform 0.3s ease',
//                     '&:hover': { transform: 'scale(1.02)' },
//                   }}
//                 >
//                   <CardContent sx={{ p: 4 }}>
//                     <Box sx={{ textAlign: 'center', mb: 3 }}>
//                       <Avatar sx={{ bgcolor: alpha(tech.color, 0.1), color: tech.color, width: 80, height: 80, mx: 'auto', mb: 2 }}>
//                         {tech.icon}
//                       </Avatar>
//                       <Typography variant="h5" fontWeight={700} gutterBottom>
//                         {tech.title}
//                       </Typography>
//                     </Box>

//                     <Divider sx={{ mb: 3, borderColor: alpha(tech.color, 0.2) }} />

//                     <List dense>
//                       {tech.items.map((item, i) => (
//                         <ListItem key={i}>
//                           <ListItemIcon>
//                             <CheckCircleIcon sx={{ color: tech.color, fontSize: 18 }} />
//                           </ListItemIcon>
//                           <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                         </ListItem>
//                       ))}
//                     </List>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Team Section */}
//         <Box id="team" sx={{ mb: 10 }}>
//           <Typography 
//             variant="h2" 
//             fontWeight={800} 
//             sx={{ 
//               mb: 6, 
//               textAlign: 'center',
//               position: 'relative',
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 bottom: -16,
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 width: 80,
//                 height: 4,
//                 bgcolor: primaryColor,
//                 borderRadius: 2,
//               }
//             }}
//           >
//             Our <Box component="span" sx={{ color: primaryColor }}>Team</Box>
//           </Typography>

//           <Grid container spacing={4} justifyContent="center">
//             {[
//               { 
//                 name: "Aya Mohamad Abu_Ghozeh", 
//                 id: "202210321", 
//                 role: "Backend Developer",
//                 icon: <StarIcon />,
//               },
//               { 
//                 name: "Hanan Nathmi Awad", 
//                 id: "202210456", 
//                 role: "Full Stack Developer",
//                 icon: <StarIcon />,
//               },
//               { 
//                 name: "Malak Naim Malak", 
//                 id: "202210273", 
//                 role: "Backend Developer",
//                 icon: <StarIcon />,
//               },
//             ].map((member, index) => (
//               <Grid item xs={12} md={4} key={index}>
//                 <Zoom in style={{ transitionDelay: `${index * 200}ms` }}>
//                   <Card 
//                     sx={{ 
//                       textAlign: 'center',
//                       bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                       borderRadius: 4,
//                       transition: 'transform 0.3s ease',
//                       '&:hover': { transform: 'translateY(-8px)' },
//                     }}
//                   >
//                     <CardContent sx={{ p: 4 }}>
//                       <Avatar 
//                         sx={{ 
//                           width: 120, 
//                           height: 120, 
//                           mx: 'auto', 
//                           mb: 2,
//                           bgcolor: primaryColor,
//                           fontSize: '3rem',
//                           border: `4px solid ${alpha(primaryColor, 0.3)}`,
//                         }}
//                       >
//                         {member.name.charAt(0)}
//                       </Avatar>

//                       <Typography variant="h5" fontWeight={700} gutterBottom>
//                         {member.name}
//                       </Typography>

//                       <Chip 
//                         label={member.id}
//                         size="small"
//                         sx={{ 
//                           mb: 1,
//                           bgcolor: alpha(primaryColor, 0.1),
//                           color: primaryColor,
//                           fontWeight: 600,
//                         }}
//                       />

//                       <Typography variant="body1" color="primary" fontWeight={600} gutterBottom>
//                         {member.role}
//                       </Typography>

//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                         Computer Systems Engineering
//                       </Typography>

//                       <Divider sx={{ my: 2, borderColor: alpha(primaryColor, 0.2) }} />

//                       <Stack direction="row" spacing={1} justifyContent="center">
//                         <IconButton size="small" sx={{ color: primaryColor }}>
//                           <GitHubIcon />
//                         </IconButton>
//                         <IconButton size="small" sx={{ color: primaryColor }}>
//                           <LinkedInIcon />
//                         </IconButton>
//                         <IconButton size="small" sx={{ color: primaryColor }}>
//                           <EmailOutlinedIcon />
//                         </IconButton>
//                       </Stack>
//                     </CardContent>
//                   </Card>
//                 </Zoom>
//               </Grid>
//             ))}
//           </Grid>

//           <Box sx={{ textAlign: 'center', mt: 4 }}>
//             <Paper
//               sx={{ 
//                 p: 3,
//                 bgcolor: isDark ? alpha('#1e1e1e', 0.8) : '#ffffff',
//                 borderRadius: 3,
//                 border: `1px solid ${alpha(primaryColor, 0.2)}`,
//                 maxWidth: 500,
//                 mx: 'auto',
//               }}
//             >
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Supervised by
//               </Typography>
//               <Typography variant="h5" fontWeight={700} sx={{ color: primaryColor }}>
//                 Thaer Sammar, Ph.D.
//               </Typography>
//             </Paper>
//           </Box>
//         </Box>

//         {/* Call to Action */}
//         <Box sx={{ mb: 6 }}>
//           <Paper
//             sx={{
//               p: 6,
//               textAlign: 'center',
//               bgcolor: isDark ? alpha('#1e1e1e', 0.95) : '#ffffff',
//               borderRadius: 4,
//               border: `1px solid ${alpha(primaryColor, 0.3)}`,
//               position: 'relative',
//               overflow: 'hidden',
//             }}
//           >
//             <Box
//               sx={{
//                 position: 'absolute',
//                 top: -50,
//                 right: -50,
//                 width: 200,
//                 height: 200,
//                 borderRadius: '50%',
//                 background: `radial-gradient(circle, ${alpha(primaryColor, 0.1)} 0%, transparent 70%)`,
//               }}
//             />

//             <Typography variant="h3" fontWeight={800} gutterBottom>
//               Ready to Get <Box component="span" sx={{ color: primaryColor }}>Started?</Box>
//             </Typography>

//             <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
//               Join the academic ecosystem to manage your graduation journey efficiently.
//             </Typography>

//             <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
//               <Button 
//                 variant="contained" 
//                 size="large"
//                 href="/request-register"
//                 endIcon={<RocketLaunchIcon />}
//                 sx={{ 
//                   bgcolor: primaryColor, 
//                   '&:hover': { bgcolor: '#b06f47' },
//                   px: 6,
//                   py: 2,
//                   borderRadius: '12px',
//                   fontSize: '1.2rem',
//                 }}
//               >
//                 Request Account Access
//               </Button>
//               <Button 
//                 variant="outlined" 
//                 size="large"
//                 href="/login"
//                 sx={{ 
//                   borderColor: alpha(primaryColor, 0.5), 
//                   color: primaryColor,
//                   px: 6,
//                   py: 2,
//                   borderRadius: '12px',
//                   fontSize: '1.2rem',
//                 }}
//               >
//                 Sign In to Portal
//               </Button>
//             </Stack>
//           </Paper>
//         </Box>

//         {/* Footer */}
//         <Box sx={{ mt: 8 }}>
//           <Divider sx={{ mb: 4, borderColor: alpha(primaryColor, 0.2) }} />

//           <Grid container spacing={4}>
//             <Grid item xs={12} md={4}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                 <SchoolIcon sx={{ color: primaryColor }} />
//                 <Typography variant="h6" fontWeight={700}>GPMS</Typography>
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
//                 Enhancing communication, supervision, and workflow management for final-year university projects.
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Typography variant="h6" fontWeight={700} gutterBottom>Quick Links</Typography>
//               <Grid container spacing={1}>
//                 {['About', 'Documentation', 'Terms', 'Privacy', 'Contact'].map((link) => (
//                   <Grid item xs={6} key={link}>
//                     <Link href="#" underline="hover" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
//                       {link}
//                     </Link>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Typography variant="h6" fontWeight={700} gutterBottom>Contact</Typography>
//               <Typography variant="body2" color="text.secondary" paragraph>
//                 Palestine Technical University (Kadoorie)
//               </Typography>
//               <Typography variant="body2" color="text.secondary" paragraph>
//                 Faculty of Engineering and Technology
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Computer Systems Engineering Department
//               </Typography>
//             </Grid>
//           </Grid>

//           <Divider sx={{ my: 4, borderColor: alpha(primaryColor, 0.2) }} />

//           <Typography variant="body2" color="text.secondary" textAlign="center">
//             © 2025 Graduation Project Management System (GPMS). All rights reserved.
//           </Typography>
//           <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 1 }}>
//             Palestine Tulkarm
//           </Typography>
//         </Box>
//       </Container>

//       {/* Floating Action Button */}
//       <Zoom in>
//         <Fab 
//           variant="extended"
//           sx={{ 
//             position: 'fixed', 
//             bottom: 24, 
//             right: 24, 
//             bgcolor: primaryColor,
//             '&:hover': { bgcolor: '#b06f47' },
//             display: { xs: 'none', md: 'flex' },
//             borderRadius: '16px',
//             px: 2,
//           }}
//           href="/request-register"
//         >
//           <SchoolIcon sx={{ mr: 1 }} />
//           Request Access
//         </Fab>
//       </Zoom>
//     </Box>
//   );
// }









// import { useState } from "react";
// import {
//   Typography,
//   Button,
//   Stack,
//   Box,
//   Grid,
//   Paper,
//   Container,
//   Link,
//   Divider,
//   Avatar,
//   alpha,
//   useTheme,
//   Card,
//   CardContent,
//   Chip,
//   AppBar,
//   Toolbar,
//   IconButton,
//   Drawer,
//   useMediaQuery,
//   Fade,
//   Zoom,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
// } from "@mui/material";

// import MenuIcon from "@mui/icons-material/Menu";
// import CloseIcon from "@mui/icons-material/Close";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import GroupsIcon from "@mui/icons-material/Groups";
// import SearchIcon from "@mui/icons-material/Search";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import TimelineIcon from "@mui/icons-material/Timeline";
// import SchoolIcon from "@mui/icons-material/School";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CodeIcon from "@mui/icons-material/Code";
// import StorageIcon from "@mui/icons-material/Storage";
// import SecurityIcon from "@mui/icons-material/Security";
// import PsychologyIcon from "@mui/icons-material/Psychology";
// import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import DescriptionIcon from "@mui/icons-material/Description";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import AutoStoriesIcon from "@mui/icons-material/AutoStories";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";
// import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import { Fab } from "@mui/material";
// import { ThemeContext } from "../../../contexts/ThemeContext";
// const primaryColor = "#d0895b";
// const secondaryColor = "#2c3e50";

// export default function LandingPage() {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === 'dark';
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//     setMobileOpen(false);
//   };

//   const drawer = (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//         <IconButton onClick={handleDrawerToggle}>
//           <CloseIcon />
//         </IconButton>
//       </Box>
//       <Stack spacing={2}>
//         <Button onClick={() => scrollToSection('home')} sx={{ justifyContent: 'flex-start' }}>Home</Button>
//         {/* <Button onClick={() => scrollToSection('overview')} sx={{ justifyContent: 'flex-start' }}>Overview</Button> */}
//         <Button onClick={() => scrollToSection('features')} sx={{ justifyContent: 'flex-start' }}>Features</Button>
//         <Button onClick={() => scrollToSection('technology')} sx={{ justifyContent: 'flex-start' }}>Technology</Button>
//         <Button onClick={() => scrollToSection('team')} sx={{ justifyContent: 'flex-start' }}>Team</Button>
//         <Divider sx={{ my: 2 }} />
//         <Button
//           variant="outlined"
//           fullWidth
//           href="/login"
//           sx={{ borderColor: primaryColor, color: primaryColor }}
//         >
//           Sign In
//         </Button>
//         <Button
//           variant="contained"
//           fullWidth
//           href="/request-register"
//           sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#b06f47' } }}
//         >
//           Request Access
//         </Button>
//       </Stack>
//     </Box>
//   );

//   return (
//     <Box sx={{
//       bgcolor: isDark ? '#1a1d23' : '#ffffff',
//       minHeight: '100vh',
//     }}>
//       {/* Very Subtle Background */}
//       <Box
//         sx={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           zIndex: 0,
//           overflow: "hidden",
//           pointerEvents: "none",
//           opacity: 0.3,
//           background: `
//             linear-gradient(135deg, ${alpha(primaryColor, 0.02)} 0%, transparent 50%),
//             linear-gradient(225deg, ${alpha(primaryColor, 0.02)} 0%, transparent 50%)
//           `,
//         }}
//       />

//       {/* Navigation - Clean and Minimal */}
//       <AppBar
//         position="sticky"
//         elevation={0}
//         sx={{
//           bgcolor: isDark ? alpha('#1a1d23', 0.98) : alpha('#ffffff', 0.98),
//           backdropFilter: 'blur(10px)',
//           borderBottom: '1px solid',
//           borderColor: alpha(primaryColor, 0.1),
//           zIndex: 1100,
//         }}
//       >
//         <Container maxWidth="lg">
//           <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 0 } }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <SchoolIcon sx={{ color: primaryColor, fontSize: 28 }} />
//               <Typography variant="h6" fontWeight={600} letterSpacing="-0.5px">
//                 <Box component="span" sx={{ color: primaryColor }}>GPMS</Box>
//               </Typography>
//             </Box>

//             {!isMobile && (
//               <Box sx={{ display: 'flex', gap: 3 }}>
//                 <Button onClick={() => scrollToSection('home')} sx={{ color: 'text.primary', fontWeight: 500 }}>Home</Button>
//                 <Button onClick={() => scrollToSection('about')} sx={{ color: 'text.primary', fontWeight: 500 }}>About</Button>
//                 <Button onClick={() => scrollToSection('features')} sx={{ color: 'text.primary', fontWeight: 500 }}>Features</Button>
//                 {/* <Button onClick={() => scrollToSection('technology')} sx={{ color: 'text.primary', fontWeight: 500 }}>Technology</Button> */}
//                 <Button onClick={() => scrollToSection('team')} sx={{ color: 'text.primary', fontWeight: 500 }}>Team</Button>
//               </Box>
//             )}

//             <Box sx={{ display: 'flex', gap: 1.5 }}>
//               {!isMobile && (
//                 <>
//                   <Button
//                     variant="text"
//                     href="/login"
//                     sx={{ color: 'text.secondary', fontWeight: 500 }}
//                   >
//                     Sign In
//                   </Button>
//                   <Button
//                     variant="contained"
//                     href="/request-register"
//                     sx={{
//                       bgcolor: primaryColor,
//                       '&:hover': { bgcolor: '#b06f47' },
//                       px: 3,
//                       borderRadius: '8px',
//                       textTransform: 'none',
//                       fontWeight: 500,
//                     }}
//                   >
//                     Get Started
//                   </Button>
//                 </>
//               )}
//               {isMobile && (
//                 <IconButton onClick={handleDrawerToggle}>
//                   <MenuIcon />
//                 </IconButton>
//               )}
//             </Box>
//           </Toolbar>
//         </Container>
//       </AppBar>

//       <Drawer
//         anchor="right"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: 280,
//             bgcolor: isDark ? '#1a1a1a' : '#ffffff',
//           },
//         }}
//       >
//         {drawer}
//       </Drawer>

//       {/* Main Content */}
//       <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>

//         {/* Hero Section - Clean and Professional */}
//         <Box id="home" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', mb: 12 }}>
//           <Grid container spacing={6} alignItems="center">
//             <Grid item xs={12} md={7}>
//               <Fade in timeout={1000}>
//                 <Box>
//                   <Chip
//                     label="PALESTINE TECHNICAL UNIVERSITY"
//                     sx={{
//                       bgcolor: alpha(primaryColor, 0.08),
//                       color: primaryColor,
//                       mb: 4,
//                       fontWeight: 500,
//                       fontSize: '0.75rem',
//                       letterSpacing: '0.5px',
//                       borderRadius: '4px',
//                     }}
//                   />

//                   <Typography
//                     variant="h1"
//                     sx={{
//                       fontSize: { xs: '2.8rem', md: '3.8rem', lg: '4.5rem' },
//                       fontWeight: 500,
//                       letterSpacing: '-1.5px',
//                       lineHeight: 1.1,
//                       mb: 3,
//                     }}
//                   >
//                     Graduation Project
//                     <Box component="span" sx={{ color: primaryColor, fontWeight: 600, display: 'block' }}>
//                       Management System
//                     </Box>
//                   </Typography>

//                   <Typography
//                     variant="h6"
//                     sx={{
//                       color: 'text.secondary',
//                       fontWeight: 400,
//                       maxWidth: 550,
//                       mb: 5,
//                       lineHeight: 1.7,
//                       fontSize: '1.2rem',
//                     }}
//                   >
//                     A centralized platform enhancing communication and workflow management for final-year university projects.
//                   </Typography>

//                   <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
//                     <Button
//                       variant="contained"
//                       size="large"
//                       href="/request-register"
//                       sx={{
//                         bgcolor: primaryColor,
//                         '&:hover': { bgcolor: '#b06f47' },
//                         px: 5,
//                         py: 1.8,
//                         borderRadius: '8px',
//                         fontSize: '1rem',
//                         fontWeight: 500,
//                         textTransform: 'none',
//                         boxShadow: 'none',
//                       }}
//                     >
//                       Request Access
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       size="large"
//                       href="/login"
//                       sx={{
//                         borderColor: alpha(primaryColor, 0.3),
//                         color: 'text.primary',
//                         px: 5,
//                         py: 1.8,
//                         borderRadius: '8px',
//                         fontSize: '1rem',
//                         fontWeight: 500,
//                         textTransform: 'none',
//                       }}
//                     >
//                       Sign In
//                     </Button>
//                   </Stack>
//                 </Box>
//               </Fade>
//             </Grid>

//             <Grid item xs={12} md={5}>
//               <Zoom in timeout={1200}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     bgcolor: isDark ? alpha('#1e1e1e', 0.5) : alpha('#f8f9fa', 0.8),
//                     borderRadius: 2,
//                     border: '1px solid',
//                     borderColor: alpha(primaryColor, 0.1),
//                   }}
//                 >
//                   <Stack spacing={5}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
//                       <Avatar sx={{ bgcolor: primaryColor, width: 48, height: 48 }}>
//                         <SchoolIcon />
//                       </Avatar>
//                       <Box>
//                         <Typography variant="h6" fontWeight={600}>GPMS</Typography>
//                         <Typography variant="body2" color="text.secondary">Academic Year 2025</Typography>
//                       </Box>
//                     </Box>

//                     <Divider sx={{ borderColor: alpha(primaryColor, 0.1) }} />

//                     <Grid container spacing={3}>
//                       <Grid item xs={6}>
//                         <Box>
//                           <Typography variant="h3" fontWeight={400} color={primaryColor}>3</Typography>
//                           <Typography variant="body2" color="text.secondary">Team Members</Typography>
//                         </Box>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Box>
//                           <Typography variant="h3" fontWeight={400} color={primaryColor}>8</Typography>
//                           <Typography variant="body2" color="text.secondary">Core Features</Typography>
//                         </Box>
//                       </Grid>
//                     </Grid>

//                     <Box>
//                       <Typography variant="body2" color="text.secondary" gutterBottom>
//                         Supervised by
//                       </Typography>
//                       <Typography variant="body1" fontWeight={500}>
//                         Thaer Sammar, Ph.D.
//                       </Typography>
//                     </Box>
//                   </Stack>
//                 </Paper>
//               </Zoom>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Full Width Slim About Banner */}
//         <Box
//           id="about"
//           sx={{
//             position: "relative",
//             width: "100vw",
//             height: { xs: 400, md: 450 },   // 👈 هذا الارتفاع الرفيع
//             marginLeft: "calc(-50vw + 50%)", // 👈 يخليه يطلع برا الكونتينر
//             overflow: "hidden",
//           }}
//         >
//           {/* Background Image */}
//           <Box
//             sx={{
//               position: "absolute",
//               inset: 0,
//               backgroundImage:
//                 "url(https://images.unsplash.com/photo-1492724441997-5dc865305da7)",
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           />

//           {/* Dark Overlay */}
//           <Box
//             sx={{
//               position: "absolute",
//               inset: 0,
//               background: `linear-gradient(
//         90deg,
//         ${alpha(secondaryColor, 0.95)} 35%,
//         ${alpha(secondaryColor, 0.7)} 60%,
//         transparent 100%
//       )`,
//             }}
//           />

//           {/* Content */}
//           <Box
//             sx={{
//               position: "relative",
//               zIndex: 1,
//               height: "100%",
//               display: "flex",
//               alignItems: "center",
//               px: { xs: 3, md: 12 }, // padding داخلي بس للنص
//             }}
//           >
//             <Box maxWidth={700}>
//               <Typography
//                 variant="h3"
//                 sx={{ color: "#fff", mb: 3 }}
//               >
//                 About GPMS
//               </Typography>

//               <Typography
//                 sx={{
//                   color: alpha("#fff", 0.85),
//                   lineHeight: 1.8,
//                 }}
//               >
//                 GPMS is a web-based Graduation Project Management System
//                 designed to enhance communication, supervision, and workflow
//                 management for final-year university projects through
//                 centralized task tracking, Kanban boards, structured file
//                 submission, and real-time notifications.
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* University Info - Minimal Bar */}
//         <Box sx={{ mb: 12 }}>
//           <Paper
//             elevation={0}
//             sx={{
//               p: 3,
//               bgcolor: isDark ? alpha('#1e1e1e', 0.3) : alpha('#f8f9fa', 0.7),
//               borderRadius: 1,
//               border: '1px solid',
//               borderColor: alpha(primaryColor, 0.1),
//             }}
//           >
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                   <AccountBalanceIcon sx={{ color: primaryColor, fontSize: 20 }} />
//                   <Typography variant="body2" fontWeight={500}>
//                     Palestine Technical University (Kadoorie)
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                   <MenuBookIcon sx={{ color: primaryColor, fontSize: 20 }} />
//                   <Typography variant="body2" fontWeight={500}>
//                     Faculty of Engineering and Technology
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                   <AutoStoriesIcon sx={{ color: primaryColor, fontSize: 20 }} />
//                   <Typography variant="body2" fontWeight={500}>
//                     Computer Systems Engineering
//                   </Typography>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Paper>
//         </Box>

//         {/* Abstract Section - Clean Academic Style
//         <Box id="overview" sx={{ mb: 15 }}>
//           <Typography 
//             variant="h3" 
//             fontWeight={500} 
//             sx={{ 
//               mb: 6, 
//               letterSpacing: '-0.5px',
//               borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
//               pb: 2,
//               display: 'inline-block',
//             }}
//           >
//             Project Overview
//           </Typography>

//           <Grid container spacing={6}>
//             <Grid item xs={12} md={6}>
//               <Box>
//                 <Typography variant="h5" fontWeight={500} gutterBottom sx={{ color: primaryColor, mb: 3 }}>
//                   Abstract
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1.1rem' }}>
//                   This project presents the development of a web-based Graduation Project Management 
//                   System (GPMS) designed to enhance communication, supervision, and workflow management 
//                   for final-year university projects. Traditional methods rely heavily on manual 
//                   communication and scattered documentation, which often lead to disorganization and delays.
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1.1rem', mt: 3 }}>
//                   The system provides a centralized digital platform that allows students and supervisors 
//                   to manage tasks, upload files, schedule meetings, track progress, and communicate effectively.
//                 </Typography>
//               </Box>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Box>
//                 <Typography variant="h5" fontWeight={500} gutterBottom sx={{ color: primaryColor, mb: 3 }}>
//                   Key Objectives
//                 </Typography>
//                 <List>
//                   {[
//                     "Enhance student-supervisor communication",
//                     "Implement Kanban-based task management",
//                     "Centralize file submission and feedback",
//                     "Streamline appointment scheduling",
//                     "Integrate AI-powered monitoring"
//                   ].map((item, index) => (
//                     <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
//                       <ListItemIcon sx={{ minWidth: 32 }}>
//                         <CheckCircleIcon sx={{ color: primaryColor, fontSize: 18 }} />
//                       </ListItemIcon>
//                       <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Box>
//             </Grid>
//           </Grid>
//         </Box> */}

//         {/* Problem & Solution - Two Column Layout */}
//         {/* <Grid container spacing={6} sx={{ mb: 15 }}>
//           <Grid item xs={12} md={6}>
//             <Paper
//               elevation={0}
//               sx={{
//                 p: 4,
//                 bgcolor: isDark ? alpha('#1e1e1e', 0.3) : alpha('#f8f9fa', 0.7),
//                 borderRadius: 2,
//                 border: '1px solid',
//                 borderColor: alpha('#f44336', 0.2),
//               }}
//             >
//               <Typography variant="h5" fontWeight={500} gutterBottom sx={{ color: '#f44336', mb: 3 }}>
//                 Challenges
//               </Typography>
//               <List>
//                 {[
//                   "Inefficient email-based communication",
//                   "Manual task tracking and disorganization",
//                   "Scattered file management",
//                   "Supervisor availability conflicts",
//                   "No centralized project platform"
//                 ].map((item, index) => (
//                   <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
//                     <ListItemIcon sx={{ minWidth: 32 }}>
//                       <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f44336' }} />
//                     </ListItemIcon>
//                     <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Paper>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Paper
//               elevation={0}
//               sx={{
//                 p: 4,
//                 bgcolor: isDark ? alpha('#1e1e1e', 0.3) : alpha('#f8f9fa', 0.7),
//                 borderRadius: 2,
//                 border: '1px solid',
//                 borderColor: alpha('#4caf50', 0.2),
//               }}
//             >
//               <Typography variant="h5" fontWeight={500} gutterBottom sx={{ color: '#4caf50', mb: 3 }}>
//                 Solutions
//               </Typography>
//               <List>
//                 {[
//                   "Centralized communication dashboard",
//                   "Kanban task management system",
//                   "Structured file repository",
//                   "Automated scheduling system",
//                   "Real-time notifications"
//                 ].map((item, index) => (
//                   <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
//                     <ListItemIcon sx={{ minWidth: 32 }}>
//                       <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4caf50' }} />
//                     </ListItemIcon>
//                     <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Paper>
//           </Grid>
//         </Grid> */}

//         {/* Features - Clean Grid */}
//         <Box id="features" sx={{ mb: 15 }}>
//           <Typography
//             variant="h3"
//             fontWeight={500}
//             sx={{
//               mb: 6,
//               letterSpacing: '-0.5px',
//               borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
//               pb: 2,
//               display: 'inline-block',
//             }}
//           >
//             Core Features
//           </Typography>

//           <Grid container spacing={3}>
//             {[
//               { title: "Team Management", desc: "Create and manage project teams" },
//               { title: "Supervisor Selection", desc: "View and request supervisors" },
//               { title: "Task Board", desc: "Kanban-style task management" },
//               { title: "File Submission", desc: "Structured document repository" },
//               { title: "Meeting Scheduling", desc: "Book supervisor appointments" },
//               { title: "Notifications", desc: "Real-time updates and alerts" },
//               { title: "Progress Tracking", desc: "Visual project dashboards" },
//               { title: "AI Insights", desc: "Performance recommendations" }
//             ].map((feature, index) => (
//               <Grid item xs={12} sm={6} md={3} key={index}>
//                 <Card
//                   elevation={0}
//                   sx={{
//                     height: '100%',
//                     bgcolor: 'transparent',
//                     border: '1px solid',
//                     borderColor: alpha(primaryColor, 0.1),
//                     borderRadius: 1,
//                     transition: 'all 0.2s ease',
//                     '&:hover': {
//                       borderColor: primaryColor,
//                     }
//                   }}
//                 >
//                   <CardContent sx={{ p: 3 }}>
//                     <Typography variant="subtitle1" fontWeight={600} gutterBottom>
//                       {feature.title}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {feature.desc}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Technology Stack - Clean Cards */}
//         {/* <Box id="technology" sx={{ mb: 15 }}>
//           <Typography 
//             variant="h3" 
//             fontWeight={500} 
//             sx={{ 
//               mb: 6, 
//               letterSpacing: '-0.5px',
//               borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
//               pb: 2,
//               display: 'inline-block',
//             }}
//           >
//             Technology Stack
//           </Typography>

//           <Grid container spacing={4}>
//             {[
//               {
//                 title: "Frontend",
//                 items: ["React.js", "Material-UI", "Node.js"],
//               },
//               {
//                 title: "Backend",
//                 items: ["ASP.NET", "RESTful APIs", "JWT"],
//               },
//               {
//                 title: "Database",
//                 items: ["SQL Server", "Git/GitHub", "AI Integration"],
//               }
//             ].map((tech, index) => (
//               <Grid item xs={12} md={4} key={index}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     bgcolor: isDark ? alpha('#1e1e1e', 0.3) : alpha('#f8f9fa', 0.7),
//                     borderRadius: 2,
//                     border: '1px solid',
//                     borderColor: alpha(primaryColor, 0.1),
//                   }}
//                 >
//                   <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: primaryColor }}>
//                     {tech.title}
//                   </Typography>
//                   <List dense>
//                     {tech.items.map((item, i) => (
//                       <ListItem key={i} sx={{ px: 0 }}>
//                         <ListItemIcon sx={{ minWidth: 28 }}>
//                           <CheckCircleIcon sx={{ color: primaryColor, fontSize: 16 }} />
//                         </ListItemIcon>
//                         <ListItemText primary={item} sx={{ color: 'text.secondary' }} />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </Box> */}

//         {/* Team Section - Professional */}
//         <Box id="team" sx={{ mb: 15 }}>
//           <Typography
//             variant="h3"
//             fontWeight={500}
//             sx={{
//               mb: 6,
//               letterSpacing: '-0.5px',
//               borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
//               pb: 2,
//               display: 'inline-block',
//             }}
//           >
//             Developer Team
//           </Typography>

//           <Grid container spacing={4} justifyContent="center">
//             {[
//               { name: "Aya Abu_Ghozeh", id: "202210321", role: "Back End Developer" },
//               { name: "Hanan Awad", id: "202210456", role: "Full Stack Developer" },
//               { name: "Malak Malak", id: "202210273", role: "Back End Developer" },
//             ].map((member, index) => (
//               <Grid item xs={12} md={4} key={index}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     textAlign: 'center',
//                     bgcolor: 'transparent',
//                     border: '1px solid',
//                     borderColor: alpha(primaryColor, 0.1),
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Avatar
//                     sx={{
//                       width: 100,
//                       height: 100,
//                       mx: 'auto',
//                       mb: 2,
//                       bgcolor: alpha(primaryColor, 0.1),
//                       color: primaryColor,
//                       fontSize: '2.5rem',
//                       fontWeight: 300,
//                     }}
//                   >
//                     {member.name.charAt(0)}
//                   </Avatar>

//                   <Typography variant="h6" fontWeight={600} gutterBottom>
//                     {member.name}
//                   </Typography>

//                   <Typography variant="body2" color="primary" gutterBottom>
//                     {member.id}
//                   </Typography>

//                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                     Computer Systems Engineering
//                   </Typography>

//                   <Typography variant="body2" color="text.secondary">
//                     {member.role}
//                   </Typography>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>

//           <Box sx={{ textAlign: 'center', mt: 4 }}>
//             <Paper
//               elevation={0}
//               sx={{
//                 p: 3,
//                 bgcolor: 'transparent',
//                 border: '1px solid',
//                 borderColor: alpha(primaryColor, 0.1),
//                 borderRadius: 2,
//                 maxWidth: 400,
//                 mx: 'auto',
//               }}
//             >
//               <Typography variant="body2" color="text.secondary" gutterBottom>
//                 Supervised by
//               </Typography>
//               <Typography variant="h6" fontWeight={500} sx={{ color: primaryColor }}>
//                 Thaer Sammar, Ph.D.
//               </Typography>
//             </Paper>
//           </Box>
//         </Box>

//         {/* Call to Action - Clean */}
//         <Box sx={{ mb: 8 }}>
//           <Paper
//             elevation={0}
//             sx={{
//               p: 6,
//               textAlign: 'center',
//               bgcolor: alpha(primaryColor, 0.02),
//               border: '1px solid',
//               borderColor: alpha(primaryColor, 0.1),
//               borderRadius: 2,
//             }}
//           >
//             <Typography variant="h3" fontWeight={500} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
//               Get Started
//             </Typography>

//             <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
//               Join the academic platform to manage your graduation project efficiently.
//             </Typography>

//             <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
//               <Button
//                 variant="contained"
//                 size="large"
//                 href="/request-register"
//                 sx={{
//                   bgcolor: primaryColor,
//                   '&:hover': { bgcolor: '#b06f47' },
//                   px: 5,
//                   py: 1.5,
//                   borderRadius: '8px',
//                   textTransform: 'none',
//                   fontWeight: 500,
//                 }}
//               >
//                 Request Access
//               </Button>
//               <Button
//                 variant="outlined"
//                 size="large"
//                 href="/login"
//                 sx={{
//                   borderColor: alpha(primaryColor, 0.3),
//                   color: 'text.primary',
//                   px: 5,
//                   py: 1.5,
//                   borderRadius: '8px',
//                   textTransform: 'none',
//                   fontWeight: 500,
//                 }}
//               >
//                 Sign In
//               </Button>
//             </Stack>
//           </Paper>
//         </Box>

//         {/* Footer - Minimal */}
//         <Box sx={{ mt: 8 }}>
//           <Divider sx={{ mb: 4, borderColor: alpha(primaryColor, 0.1) }} />

//           <Grid container spacing={4}>
//             <Grid item xs={12} md={4}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                 <SchoolIcon sx={{ color: primaryColor }} />
//                 <Typography variant="h6" fontWeight={500}>GPMS</Typography>
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
//                 Graduation Project Management System
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Typography variant="subtitle2" fontWeight={600} gutterBottom>Quick Links</Typography>
//               <Grid container spacing={1}>
//                 {['About', 'Documentation', 'Terms', 'Contact'].map((link) => (
//                   <Grid item xs={6} key={link}>
//                     <Link href="#" underline="hover" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
//                       {link}
//                     </Link>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Typography variant="subtitle2" fontWeight={600} gutterBottom>Contact</Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Palestine Technical University<br />
//                 Faculty of Engineering<br />
//                 Computer Systems Engineering
//               </Typography>
//             </Grid>
//           </Grid>

//           <Divider sx={{ my: 4, borderColor: alpha(primaryColor, 0.1) }} />

//           <Typography variant="body2" color="text.secondary" textAlign="center">
//             © 2025 GPMS. All rights reserved. Palestine Tulkarm
//           </Typography>
//         </Box>
//       </Container>

//       {/* Floating Button */}
//       <Zoom in>
//         <Fab
//           size="medium"
//           sx={{
//             position: 'fixed',
//             bottom: 24,
//             right: 24,
//             bgcolor: primaryColor,
//             '&:hover': { bgcolor: '#b06f47' },
//             display: { xs: 'none', md: 'flex' },
//           }}
//           href="/request-register"
//         >
//           <SchoolIcon />
//         </Fab>
//       </Zoom>
//     </Box>
//   );
// }
import { useState, useContext } from "react";
import {
  Typography,
  Button,
  Stack,
  Box,
  Grid,
  Paper,
  Container,
  Link,
  Divider,
  Avatar,
  alpha,
  useTheme,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useMediaQuery,
  Fade,
  Zoom,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

// 👇 أضفنا import للـ ThemeContext


import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import PsychologyIcon from "@mui/icons-material/Psychology";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Fab } from "@mui/material";

// 👇 أضفنا ايقونة الشمس والقمر
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeContext } from "../../../contexts/ThemeContext";
const primaryColor = "#d0895b";
const secondaryColor = "#2c3e50";

export default function LandingPage() {
  const theme = useTheme();
  // 👇 جبنا الـ mode و toggleTheme من الـ Context
  const { mode, toggleTheme } = useContext(ThemeContext);
  const isDark = mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack spacing={2}>
        <Button onClick={() => scrollToSection('home')} sx={{ justifyContent: 'flex-start' }}>Home</Button>
        <Button onClick={() => scrollToSection('features')} sx={{ justifyContent: 'flex-start' }}>Features</Button>
        <Button onClick={() => scrollToSection('technology')} sx={{ justifyContent: 'flex-start' }}>Technology</Button>
        <Button onClick={() => scrollToSection('team')} sx={{ justifyContent: 'flex-start' }}>Team</Button>
        <Divider sx={{ my: 2 }} />
        <Button
          variant="outlined"
          fullWidth
          href="/login"
          sx={{ borderColor: primaryColor, color: primaryColor }}
        >
          Sign In
        </Button>
        <Button
          variant="contained"
          fullWidth
          href="/request-register"
          sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#b06f47' } }}
        >
          Request Access
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{
      bgcolor: isDark ? '#1a1d23' : '#ffffff',
      minHeight: '100vh',
    }}>
      {/* Very Subtle Background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0.3,
          background: `
            linear-gradient(135deg, ${alpha(primaryColor, 0.02)} 0%, transparent 50%),
            linear-gradient(225deg, ${alpha(primaryColor, 0.02)} 0%, transparent 50%)
          `,
        }}
      />

      {/* Navigation - مع زر التبديل */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: isDark ? alpha('#1a1d23', 0.98) : alpha('#ffffff', 0.98),
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: alpha(primaryColor, 0.1),
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ color: primaryColor, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600} letterSpacing="-0.5px">
                <Box component="span" sx={{ color: primaryColor }}>GPMS</Box>
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button onClick={() => scrollToSection('home')} sx={{ color: 'text.primary', fontWeight: 500 }}>Home</Button>
                <Button onClick={() => scrollToSection('about')} sx={{ color: 'text.primary', fontWeight: 500 }}>About</Button>
                <Button onClick={() => scrollToSection('features')} sx={{ color: 'text.primary', fontWeight: 500 }}>Features</Button>
                <Button onClick={() => scrollToSection('team')} sx={{ color: 'text.primary', fontWeight: 500 }}>Team</Button>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {/* 👇 زر التبديل بين Dark/Light mode */}
              <IconButton onClick={toggleTheme} color="inherit">
                {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              
              {!isMobile && (
                <>
                  <Button
                    variant="text"
                    href="/login"
                    sx={{ color: 'text.secondary', fontWeight: 500 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    href="/request-register"
                    sx={{
                      bgcolor: primaryColor,
                      '&:hover': { bgcolor: '#b06f47' },
                      px: 3,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
              {isMobile && (
                <IconButton onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: isDark ? '#1a1a1a' : '#ffffff',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* باقي الكود كما هو... */}

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>

        {/* Hero Section */}
        <Box id="home" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', mb: 12 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip
                    label="PALESTINE TECHNICAL UNIVERSITY"
                    sx={{
                      bgcolor: alpha(primaryColor, 0.08),
                      color: primaryColor,
                      mb: 4,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      borderRadius: '4px',
                    }}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.8rem', md: '3.8rem', lg: '4.5rem' },
                      fontWeight: 500,
                      letterSpacing: '-1.5px',
                      lineHeight: 1.1,
                      mb: 3,
                    }}
                  >
                    Graduation Project
                    <Box component="span" sx={{ color: primaryColor, fontWeight: 600, display: 'block' }}>
                      Management System
                    </Box>
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 400,
                      maxWidth: 550,
                      mb: 5,
                      lineHeight: 1.7,
                      fontSize: '1.2rem',
                    }}
                  >
                    A centralized platform enhancing communication and workflow management for final-year university projects.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      href="/request-register"
                      sx={{
                        bgcolor: primaryColor,
                        '&:hover': { bgcolor: '#b06f47' },
                        px: 5,
                        py: 1.8,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      Request Access
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      href="/login"
                      sx={{
                        borderColor: alpha(primaryColor, 0.3),
                        color: 'text.primary',
                        px: 5,
                        py: 1.8,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
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
                    p: 4,
                    bgcolor: isDark ? alpha('#1e1e1e', 0.5) : alpha('#f8f9fa', 0.8),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(primaryColor, 0.1),
                  }}
                >
                  <Stack spacing={5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar sx={{ bgcolor: primaryColor, width: 48, height: 48 }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>GPMS</Typography>
                        <Typography variant="body2" color="text.secondary">Academic Year 2025</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: alpha(primaryColor, 0.1) }} />

                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="h3" fontWeight={400} color={primaryColor}>3</Typography>
                          <Typography variant="body2" color="text.secondary">Team Members</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="h3" fontWeight={400} color={primaryColor}>8</Typography>
                          <Typography variant="body2" color="text.secondary">Core Features</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Supervised by
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        Thaer Sammar, Ph.D.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>

        {/* Full Width Slim About Banner */}
        <Box
          id="about"
          sx={{
            position: "relative",
            width: "100vw",
            height: { xs: 400, md: 450 },
            marginLeft: "calc(-50vw + 50%)",
            overflow: "hidden",
          }}
        >
          {/* Background Image */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url(https://images.unsplash.com/photo-1492724441997-5dc865305da7)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Dark Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(
        90deg,
        ${alpha(secondaryColor, 0.95)} 35%,
        ${alpha(secondaryColor, 0.7)} 60%,
        transparent 100%
      )`,
            }}
          />

          {/* Content */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              px: { xs: 3, md: 12 },
            }}
          >
            <Box maxWidth={700}>
              <Typography
                variant="h3"
                sx={{ color: "#fff", mb: 3 }}
              >
                About GPMS
              </Typography>

              <Typography
                sx={{
                  color: alpha("#fff", 0.85),
                  lineHeight: 1.8,
                }}
              >
                GPMS is a web-based Graduation Project Management System
                designed to enhance communication, supervision, and workflow
                management for final-year university projects through
                centralized task tracking, Kanban boards, structured file
                submission, and real-time notifications.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* University Info - Minimal Bar */}
        <Box sx={{ mb: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: isDark ? alpha('#1e1e1e', 0.3) : alpha('#f8f9fa', 0.7),
              borderRadius: 1,
              border: '1px solid',
              borderColor: alpha(primaryColor, 0.1),
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountBalanceIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Palestine Technical University (Kadoorie)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MenuBookIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Faculty of Engineering and Technology
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AutoStoriesIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Computer Systems Engineering
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Features - Clean Grid */}
        <Box id="features" sx={{ mb: 15 }}>
          <Typography
            variant="h3"
            fontWeight={500}
            sx={{
              mb: 6,
              letterSpacing: '-0.5px',
              borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
              pb: 2,
              display: 'inline-block',
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
              { title: "AI Insights", desc: "Performance recommendations" }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    bgcolor: 'transparent',
                    border: '1px solid',
                    borderColor: alpha(primaryColor, 0.1),
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: primaryColor,
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section - Professional */}
        <Box id="team" sx={{ mb: 15 }}>
          <Typography
            variant="h3"
            fontWeight={500}
            sx={{
              mb: 6,
              letterSpacing: '-0.5px',
              borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
              pb: 2,
              display: 'inline-block',
            }}
          >
            Developer Team
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {[
              { name: "Aya Abu_Ghozeh", id: "202210321", role: "Back End Developer" },
              { name: "Hanan Awad", id: "202210456", role: "Full Stack Developer" },
              { name: "Malak Malak", id: "202210273", role: "Back End Developer" },
            ].map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'transparent',
                    border: '1px solid',
                    borderColor: alpha(primaryColor, 0.1),
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: alpha(primaryColor, 0.1),
                      color: primaryColor,
                      fontSize: '2.5rem',
                      fontWeight: 300,
                    }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {member.name}
                  </Typography>

                  <Typography variant="body2" color="primary" gutterBottom>
                    {member.id}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Computer Systems Engineering
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: alpha(primaryColor, 0.1),
                borderRadius: 2,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Supervised by
              </Typography>
              <Typography variant="h6" fontWeight={500} sx={{ color: primaryColor }}>
                Thaer Sammar, Ph.D.
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Call to Action - Clean */}
        <Box sx={{ mb: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: alpha(primaryColor, 0.02),
              border: '1px solid',
              borderColor: alpha(primaryColor, 0.1),
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" fontWeight={500} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
              Get Started
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Join the academic platform to manage your graduation project efficiently.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                href="/request-register"
                sx={{
                  bgcolor: primaryColor,
                  '&:hover': { bgcolor: '#b06f47' },
                  px: 5,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Request Access
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="/login"
                sx={{
                  borderColor: alpha(primaryColor, 0.3),
                  color: 'text.primary',
                  px: 5,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* Footer - Minimal */}
        <Box sx={{ mt: 8 }}>
          <Divider sx={{ mb: 4, borderColor: alpha(primaryColor, 0.1) }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SchoolIcon sx={{ color: primaryColor }} />
                <Typography variant="h6" fontWeight={500}>GPMS</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Graduation Project Management System
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Quick Links</Typography>
              <Grid container spacing={1}>
                {['About', 'Documentation', 'Terms', 'Contact'].map((link) => (
                  <Grid item xs={6} key={link}>
                    <Link href="#" underline="hover" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                      {link}
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Contact</Typography>
              <Typography variant="body2" color="text.secondary">
                Palestine Technical University<br />
                Faculty of Engineering<br />
                Computer Systems Engineering
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: alpha(primaryColor, 0.1) }} />

          <Typography variant="body2" color="text.secondary" textAlign="center">
            © 2025 GPMS. All rights reserved. Palestine Tulkarm
          </Typography>
        </Box>
      </Container>

      {/* Floating Button */}
      <Zoom in>
        <Fab
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: primaryColor,
            '&:hover': { bgcolor: '#b06f47' },
            display: { xs: 'none', md: 'flex' },
          }}
          href="/request-register"
        >
          <SchoolIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}