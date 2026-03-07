// import AppRoutes from "./routes/AppRoutes";

// function App() {
//   return <AppRoutes />;
// }

// export default App;
import { useMemo } from "react";
import { ThemeProvider } from "@mui/material";
import { useThemeContext } from "./contexts/ThemeContext";
import { getTheme } from "./theme/theme";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { mode } = useThemeContext();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;