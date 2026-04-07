import { createTheme } from "@mui/material/styles";

// ─── Color Palettes ───────────────────────────────────────────────────────────

const lightTokens = {
  bgPrimary: "#F9F7F4",
  bgSecondary: "#FFFFFF",
  surfaceCard: "#FFFFFF",
  surfaceHover: "#F5F3F0",
  textPrimary: "#1F2937",
  textSecondary: "#5C6B7E",
  textTertiary: "#8B9AAD",
  accentPrimary: "#B46F4C",   // terracotta
  accentSecondary: "#6D8A7D", // sage
  accentTertiary: "#C49A6C",  // gold
  borderLight: "#E8E6E1",
  borderFocus: "#B46F4C",
  success: "#6D8A7D",
  warning: "#C49A6C",
  error: "#C47E7E",
  shadowSm: "0 2px 8px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.06)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.08)",
};

const darkTokens = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  // طبقات واضحة بفرق محسوس بين كل level
  bgPrimary: "#13161C",   // أغمق — خلفية الصفحة الرئيسية
  bgSecondary: "#1E2229",   // sidebar / drawer
  surfaceCard: "#262C35",   // كروت وpapers — فرق واضح عن bgSecondary
  surfaceHover: "#2F3640",   // hover state — أفتح من surfaceCard

  // ── Text ─────────────────────────────────────────────────────────────────
  // فرق كافٍ بين المستويات الثلاثة
  textPrimary: "#EDF2F7",  // نص رئيسي — أبيض دافئ
  textSecondary: "#9AAABB",  // نص ثانوي — contrast واضح
  textTertiary: "#627080",  // نص خافت — أغمق من قبل عشان يتميّز

  // ── Accents ──────────────────────────────────────────────────────────────
  accentPrimary: "#E59873", // terracotta light
  accentSecondary: "#8DA18E", // sage light
  accentTertiary: "#E5C28E", // gold light

  // ── Borders ──────────────────────────────────────────────────────────────
  borderLight: "#404850",    // أوضح من قبل (#363C45) — يبيّن الفواصل
  borderFocus: "#E59873",

  // ── Semantic ─────────────────────────────────────────────────────────────
  success: "#8DA18E",
  warning: "#E5C28E",
  error: "#D48A8A",        // أفتح شوية للـ dark mode

  // ── Shadows ──────────────────────────────────────────────────────────────
  // ظلال أعمق لأن الخلفية أغمق
  shadowSm: "0 2px 8px rgba(0,0,0,0.45)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.55)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.65)",
};

// ─── Theme Factory ─────────────────────────────────────────────────────────────

export const getTheme = (mode = "light") => {
  const t = mode === "light" ? lightTokens : darkTokens;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: t.accentPrimary,
        light: mode === "light" ? "#C9896A" : "#F0AD88",
        dark: mode === "light" ? "#9A5E3D" : "#CC7D57",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: t.accentSecondary,
        light: mode === "light" ? "#8DA18E" : "#A3B8A4",
        dark: mode === "light" ? "#556E62" : "#6D8A7D",
        contrastText: "#FFFFFF",
      },
      background: {
        default: t.bgPrimary,
        paper: t.surfaceCard,
      },
      text: {
        primary: t.textPrimary,
        secondary: t.textSecondary,
        disabled: t.textTertiary,
      },
      divider: t.borderLight,
      success: {
        main: t.success,
        contrastText: "#FFFFFF",
      },
      warning: {
        main: t.warning,
        contrastText: "#FFFFFF",
      },
      error: {
        main: t.error,
        contrastText: "#FFFFFF",
      },
      // Custom tokens exposed via palette
      custom: { ...t },
    },

    // ─── Typography ──────────────────────────────────────────────────────────
    typography: {
      fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: "2.25rem",
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 600,
        fontSize: "1.75rem",
        letterSpacing: "-0.015em",
        lineHeight: 1.3,
      },
      h3: {
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 700,
        fontSize: "1.375rem",
        letterSpacing: "-0.01em",
        lineHeight: 1.4,
      },
      h4: {
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 600,
        fontSize: "1.125rem",
        letterSpacing: "-0.005em",
        lineHeight: 1.4,
      },
      h5: {
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      h6: {
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 600,
        fontSize: "0.875rem",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        lineHeight: 1.5,
      },
      body1: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.9375rem",
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.875rem",
        lineHeight: 1.6,
        fontWeight: 400,
      },
      caption: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.75rem",
        lineHeight: 1.5,
        fontWeight: 400,
        color: t.textTertiary,
      },
      overline: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      },
      button: {
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 500,
        fontSize: "0.875rem",
        letterSpacing: "0.01em",
        textTransform: "none",
      },
    },

    // ─── Shape ───────────────────────────────────────────────────────────────
    shape: {
      borderRadius: 10,
    },

    // ─── Shadows ─────────────────────────────────────────────────────────────
    shadows: [
      "none",
      t.shadowSm,
      t.shadowMd,
      t.shadowLg,
      t.shadowLg,
      ...Array(20).fill(t.shadowLg),
    ],

    // ─── Component Overrides ─────────────────────────────────────────────────
    components: {
      // Paper
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 12,
            border: `1px solid ${t.borderLight}`,
          },
          elevation0: { boxShadow: "none" },
          elevation1: { boxShadow: t.shadowSm },
          elevation2: { boxShadow: t.shadowMd },
          elevation3: { boxShadow: t.shadowLg },
        },
      },

      // Card
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 12,
            border: `1px solid ${t.borderLight}`,
            boxShadow: t.shadowSm,
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            "&:hover": {
              boxShadow: t.shadowMd,
            },
          },
        },
      },

      // Button
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 500,
            textTransform: "none",
            fontSize: "0.875rem",
            transition: "all 0.2s ease",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: t.shadowSm,
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          outlined: {
            borderColor: t.borderLight,
            "&:hover": {
              borderColor: t.accentPrimary,
              backgroundColor: "transparent",
            },
          },
          text: {
            "&:hover": {
              backgroundColor: t.surfaceHover,
            },
          },
        },
      },

      // IconButton
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: t.surfaceHover,
            },
          },
        },
      },

      // TextField
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            "& fieldset": {
              borderColor: t.borderLight,
              transition: "border-color 0.2s ease",
            },
            "&:hover fieldset": {
              borderColor: t.textSecondary,
            },
            "&.Mui-focused fieldset": {
              borderColor: t.borderFocus,
              borderWidth: "1.5px",
            },
          },
          input: {
            fontSize: "0.875rem",
            color: t.textPrimary,
            "&::placeholder": {
              color: t.textTertiary,
              opacity: 1,
            },
          },
        },
      },

      // Chip
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: "0.75rem",
            fontWeight: 500,
            height: 26,
          },
        },
      },

      // Tooltip
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: t.textPrimary,
            color: mode === "light" ? "#FFFFFF" : t.bgSecondary,
            fontSize: "0.75rem",
            fontWeight: 400,
            borderRadius: 6,
            padding: "5px 10px",
          },
          arrow: {
            color: t.textPrimary,
          },
        },
      },

      // Divider
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: t.borderLight,
          },
        },
      },

      // Table
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${t.borderLight}`,
            fontSize: "0.875rem",
            padding: "12px 16px",
          },
          head: {
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: t.textSecondary,
            backgroundColor: t.bgPrimary,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.15s ease",
            "&:hover": {
              backgroundColor: t.surfaceHover,
            },
          },
        },
      },

      // Menu
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${t.borderLight}`,
            boxShadow: t.shadowMd,
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            borderRadius: 6,
            margin: "2px 6px",
            padding: "8px 12px",
            minWidth: 180,
            transition: "background-color 0.15s ease",
            "&:hover": {
              backgroundColor: t.surfaceHover,
            },
            "&.Mui-selected": {
              backgroundColor: `${t.accentPrimary}18`,
              "&:hover": {
                backgroundColor: `${t.accentPrimary}28`,
              },
            },
          },
        },
      },

      // Dialog
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${t.borderLight}`,
          },
        },
      },

      // Tabs
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            minHeight: 42,
            padding: "8px 16px",
            color: t.textSecondary,
            "&.Mui-selected": {
              color: t.accentPrimary,
              fontWeight: 600,
            },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: t.accentPrimary,
            height: 2,
            borderRadius: 2,
          },
        },
      },

      // Badge
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontSize: "0.65rem",
            fontWeight: 700,
            minWidth: 18,
            height: 18,
            padding: "0 4px",
          },
        },
      },

      // Alert
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontSize: "0.875rem",
          },
        },
      },

      // LinearProgress
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
            backgroundColor: t.borderLight,
          },
          bar: {
            borderRadius: 4,
          },
        },
      },

      // Drawer (Sidebar)
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: "none",
            borderRight: `1px solid ${t.borderLight}`,
            backgroundColor: t.bgSecondary,
          },
        },
      },

      // AppBar
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: t.bgSecondary,
            backgroundImage: "none",
            borderBottom: `1px solid ${t.borderLight}`,
            boxShadow: "none",
          },
        },
      },

      // ListItemButton
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: "1px 8px",
            padding: "8px 12px",
            transition: "all 0.15s ease",
            "&.Mui-selected": {
              backgroundColor: `${t.accentPrimary}15`,
              color: t.accentPrimary,
              "&:hover": {
                backgroundColor: `${t.accentPrimary}22`,
              },
              "& .MuiListItemIcon-root": {
                color: t.accentPrimary,
              },
            },
            "&:hover": {
              backgroundColor: t.surfaceHover,
            },
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 36,
            color: t.textSecondary,
          },
        },
      },

      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        },
      },

      // Switch
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
          },
          switchBase: {
            padding: 0,
            margin: 2,
            transitionDuration: "300ms",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              "& + .MuiSwitch-track": {
                backgroundColor: t.accentPrimary,
                opacity: 1,
                border: 0,
              },
            },
          },
          thumb: {
            boxSizing: "border-box",
            width: 22,
            height: 22,
          },
          track: {
            borderRadius: 13,
            backgroundColor: t.borderLight,
            opacity: 1,
          },
        },
      },

      // Skeleton
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: t.surfaceHover,
          },
        },
      },
    },
  });
};

export { lightTokens, darkTokens };