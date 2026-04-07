import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from '@mui/icons-material/Google';
import api from "../api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate fields
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    
    try {
      const response = await api.post("/auth", formData);
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data || err.message || "Invalid email or password";
      setError(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f4f4f4",
        p: 2,
      }}
    >
      <Card sx={{ width: 400, borderRadius: 3, boxShadow: 6, p: 3 }}>
        <CardContent>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ color: "#3d314a" }}
          >
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              variant="outlined"
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "50px", height: 40 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              variant="outlined"
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "50px", height: 40 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "#3d314a",
                color: "#e0ddcf",
                py: 1.2,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                mb: 2,
                "&:hover": { bgcolor: "#483b56ff" },
              }}
            >
              Login
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography sx={{ mx: 1, color: "text.secondary", fontSize: 14 }}>or</Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              color: "#3d314a",
              borderColor: "#3d314a",
              py: 1.2,
              "&:hover": { bgcolor: "#f0f0f0" },
              mb: 2,
            }}
          >
            Sign in with Google
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#0077B5", textDecoration: "none" }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
