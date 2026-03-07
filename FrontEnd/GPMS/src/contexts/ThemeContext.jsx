// import { createContext, useMemo, useState } from "react";
// import { ThemeProvider, CssBaseline } from "@mui/material";
// import { createTheme } from "@mui/material/styles";

// export const ThemeContext = createContext();

// export default function CustomThemeProvider({ children }) {
//   const [mode, setMode] = useState("dark");

//   const toggleTheme = () => {
//     setMode(prev => (prev === "dark" ? "light" : "dark"));
//   };

//   const theme = useMemo(() =>
//     createTheme({
//       palette: {
//         mode,
//         primary: { main: "#d48a63" },
//       },
//     }), [mode]
//   );

//   return (
//     <ThemeContext.Provider value={{ mode, toggleTheme }}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         {children}
//       </ThemeProvider>
//     </ThemeContext.Provider>
//   );
// }



import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export default function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => {
    // Try to read saved preference; otherwise fall back to system preference
    const saved = localStorage.getItem("gpms_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("gpms_theme", mode);
    // Sync html data attribute (useful for any global CSS selectors)
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const setLight = () => setMode("light");
  const setDark = () => setMode("dark");

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error(
      "useThemeContext must be used inside ThemeContextProvider"
    );
  return ctx;
};