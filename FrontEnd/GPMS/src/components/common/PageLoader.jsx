import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PageLoader({ message = "Loading..." }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <CircularProgress
        size={36}
        thickness={3.5}
        sx={{ color: theme.palette.primary.main }}
      />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}