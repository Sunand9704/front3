import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Link,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  loginVendor,
  sendVendorOtp,
  verifyVendorOtp,
  resetVendorPassword,
  fetchCategories,
} from "../api";

const LOGIN_URL = "http://localhost:8081/api/vendor/login";
const SEND_OTP_URL = "http://localhost:8081/api/vendor/send-otp";
const VERIFY_OTP_URL = "http://localhost:8081/api/vendor/verify-otp";
const RESET_URL = "http://localhost:8081/api/vendor/reset-password";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendOtpMsg, setSendOtpMsg] = useState("");
  const [sendOtpError, setSendOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyOtpMsg, setVerifyOtpMsg] = useState("");
  const [verifyOtpError, setVerifyOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories. Please refresh the page.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    console.log("DEBUG: Login form submitted");
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Send category as part of login
      const data = await loginVendor(email, password, category);
      localStorage.setItem("token", data.token);
      localStorage.setItem("selectedCategory", category); // Store selected category
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    console.log("DEBUG: Send OTP clicked");
    e.preventDefault();
    setSendOtpMsg("");
    setSendOtpError("");
    setVerifyOtpMsg("");
    setVerifyOtpError("");
    setOtp("");
    setNewPassword("");
    try {
      await sendVendorOtp(forgotEmail);
      setSendOtpMsg("OTP sent to your email.");
      setTimeout(() => {
        setForgotOpen(false);
        setOtpOpen(true);
      }, 1200);
    } catch (err) {
      setSendOtpError(err.message || "Failed to send OTP");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    console.log("DEBUG: Verify OTP clicked");
    e.preventDefault();
    setVerifyOtpMsg("");
    setVerifyOtpError("");
    try {
      await verifyVendorOtp(forgotEmail, otp);
      setVerifyOtpMsg("OTP verified. You can now set a new password.");
      setTimeout(() => {
        setOtpOpen(false);
        setResetOpen(true);
      }, 1200);
    } catch (err) {
      setVerifyOtpError(err.message || "Invalid or expired OTP");
    }
  };

  // Step 3: Reset Password
  const handleReset = async (e) => {
    console.log("DEBUG: Reset Password clicked");
    e.preventDefault();
    setResetMsg("");
    setResetError("");
    try {
      await resetVendorPassword(forgotEmail, otp, newPassword);
      setResetMsg("Password reset successful! You can now log in.");
      setTimeout(() => {
        setResetOpen(false);
      }, 1500);
    } catch (err) {
      setResetError(err.message || "Failed to reset password");
    }
  };

  // Debug logs for dialog open/close
  const openForgotDialog = () => {
    console.log("DEBUG: Forgot dialog opened");
    setForgotOpen(true);
  };
  const closeForgotDialog = () => {
    console.log("DEBUG: Forgot dialog closed");
    setForgotOpen(false);
  };
  const openOtpDialog = () => {
    console.log("DEBUG: OTP dialog opened");
    setOtpOpen(true);
  };
  const closeOtpDialog = () => {
    console.log("DEBUG: OTP dialog closed");
    setOtpOpen(false);
  };
  const openResetDialog = () => {
    console.log("DEBUG: Reset dialog opened");
    setResetOpen(true);
  };
  const closeResetDialog = () => {
    console.log("DEBUG: Reset dialog closed");
    setResetOpen(false);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f7f8fa"
      >
        <Card sx={{ minWidth: 350, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Vendor Login
            </Typography>
            {/* LOGIN FORM ONLY */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                autoFocus
                type="email"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>Loading categories...</MenuItem>
                  ) : categories.length === 0 ? (
                    <MenuItem disabled>No categories available</MenuItem>
                  ) : (
                    categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Box textAlign="right" sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={openForgotDialog}
                  sx={{
                    textTransform: "none",
                    fontSize: 14,
                    p: 0,
                    minWidth: 0,
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* DIALOGS OUTSIDE THE LOGIN FORM */}
      <>
        {/* Forgot Password Dialog (Step 1: Send OTP) */}
        <Dialog open={forgotOpen} onClose={closeForgotDialog}>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter your email to receive an OTP for password reset.
            </Typography>
            <Box>
              <TextField
                label="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                fullWidth
                margin="normal"
                type="email"
              />
              {sendOtpMsg && <Alert severity="success">{sendOtpMsg}</Alert>}
              {sendOtpError && <Alert severity="error">{sendOtpError}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={closeForgotDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSendOtp} variant="contained">
              Send OTP
            </Button>
          </DialogActions>
        </Dialog>

        {/* OTP Dialog (Step 2: Verify OTP) */}
        <Dialog open={otpOpen} onClose={closeOtpDialog}>
          <DialogTitle>Verify OTP</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter the OTP sent to your email.
            </Typography>
            <Box>
              <TextField
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                margin="normal"
              />
              {verifyOtpMsg && <Alert severity="success">{verifyOtpMsg}</Alert>}
              {verifyOtpError && (
                <Alert severity="error">{verifyOtpError}</Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={closeOtpDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleVerifyOtp} variant="contained">
              Verify OTP
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog (Step 3) */}
        <Dialog open={resetOpen} onClose={closeResetDialog}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter your new password.
            </Typography>
            <Box>
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              {resetMsg && <Alert severity="success">{resetMsg}</Alert>}
              {resetError && <Alert severity="error">{resetError}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={closeResetDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleReset} variant="contained">
              Reset
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </Box>
  );
};

export default Login;
