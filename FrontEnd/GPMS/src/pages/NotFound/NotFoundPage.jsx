import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../contexts/AuthContext";

const ROLE_HOME = { admin: "/admin", supervisor: "/supervisor", student: "/student" };

export default function NotFoundPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { role } = useAuth();
    const t = theme.palette.custom;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: t.bgPrimary,
                gap: 2,
                p: 3,
                textAlign: "center",
            }}
        >
            <Typography
                sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "6rem",
                    fontWeight: 700,
                    color: t.accentPrimary,
                    lineHeight: 1,
                }}
            >
                404
            </Typography>
            <Typography variant="h3" sx={{ color: t.textPrimary }}>
                Page not found
            </Typography>
            <Typography sx={{ color: t.textSecondary, maxWidth: 360 }}>
                The page you're looking for doesn't exist or you don't have permission
                to access it.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate(role ? ROLE_HOME[role] : "/login")}
                sx={{ mt: 1, bgcolor: t.accentPrimary }}
            >
                Go Home
            </Button>
        </Box>
    );
}