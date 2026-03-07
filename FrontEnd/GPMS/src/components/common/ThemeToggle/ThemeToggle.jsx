// import { useContext } from "react";
// import { IconButton } from "@mui/material";
// import LightModeIcon from "@mui/icons-material/LightMode";
// import DarkModeIcon from "@mui/icons-material/DarkMode";
// import { ThemeContext } from "../../../contexts/ThemeContext";

// export default function ThemeToggle() {
//   const { mode, toggleTheme } = useContext(ThemeContext);

//   return (
//     <IconButton onClick={toggleTheme} color="inherit">
//       {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
//     </IconButton>
//   );
// }
import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../../../contexts/ThemeContext';

const ThemeToggle = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();

  return (
    <IconButton
      onClick={toggleTheme}
      sx={{
        color: mode === 'dark' ? theme.palette.warning.main : theme.palette.primary.main,
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'rotate(180deg)',
        },
      }}
    >
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};

export default ThemeToggle;