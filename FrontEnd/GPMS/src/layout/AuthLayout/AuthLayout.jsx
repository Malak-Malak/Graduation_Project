import { Box } from "@mui/material";
import ThemeToggle from "../../components/common/ThemeToggle/ThemeToggle.jsx";

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        px: 4,
      }}
    >
      {/* Theme Toggle */}
      <Box
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
        }}
      >
        <ThemeToggle />
      </Box>

      {children}
    </Box>
  );
}



// import React from 'react';
// import { Box, Container, Paper, useTheme } from '@mui/material';

// const AuthLayout = ({ children }) => {
//   const theme = useTheme();

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         bgcolor: theme.palette.background.default,
//         position: 'relative',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Background decorative elements */}
//       <Box
//         sx={{
//           position: 'absolute',
//           top: -100,
//           right: -100,
//           width: 300,
//           height: 300,
//           borderRadius: '50%',
//           bgcolor: theme.palette.primary.main,
//           opacity: 0.1,
//         }}
//       />
//       <Box
//         sx={{
//           position: 'absolute',
//           bottom: -100,
//           left: -100,
//           width: 300,
//           height: 300,
//           borderRadius: '50%',
//           bgcolor: theme.palette.secondary.main,
//           opacity: 0.1,
//         }}
//       />

//       <Container maxWidth="sm">
//         <Paper
//           elevation={0}
//           sx={{
//             p: 4,
//             borderRadius: 3,
//             bgcolor: theme.palette.background.paper,
//             border: `1px solid ${theme.palette.divider}`,
//             position: 'relative',
//             zIndex: 1,
//           }}
//         >
//           {children}
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default AuthLayout;