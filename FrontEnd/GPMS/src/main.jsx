
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider, CssBaseline } from "@mui/material";

import App from "./App";
import ThemeContextProvider from "./contexts/ThemeContext";
import { getTheme } from "./theme/theme";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeContextProvider>
      <ThemeProvider theme={getTheme()}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ThemeContextProvider>
  </StrictMode>
);
