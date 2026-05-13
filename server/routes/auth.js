const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  register,
  verifyEmailOtp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  login,
  resendVerifyOtp,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

router.post("/login",            login);
router.post("/register",         register);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-verify-otp",resendVerifyOtp);
router.post("/forgot-password",  forgotPassword);
router.post("/verify-otp",       verifyOtp);
router.post("/reset-password",   resetPassword);

// ── Profile (protected) ──
router.get("/profile",    userAuth, getProfile);
router.put("/profile",    userAuth, updateProfile);

module.exports = router;