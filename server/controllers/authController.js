const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const otpStore = {};

// ── LOGIN ──
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email." });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── REGISTER ──
const register = async (req, res) => {
  const { firstName, lastName, email, phone, whatsapp, alternatePhone, password, homeAddress, workAddress, landmark, city, pincode } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName, lastName, email, phone,
      whatsapp: whatsapp || phone,
      alternatePhone: alternatePhone || "",
      password: hashedPassword,
      homeAddress, workAddress, landmark, city,
      pincode: pincode || "",
      isVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendEmail(
      email,
      "Verify your Email - Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:8px;">
        <h2 style="color:#1a1108;">Welcome to Shree Chemicals!</h2>
        <p style="color:#555;">Hi ${firstName}, please verify your email using the OTP below:</p>
        <div style="font-size:36px;font-weight:bold;color:#c8963a;letter-spacing:8px;margin:1rem 0;">${otp}</div>
        <p style="color:#999;font-size:12px;">Valid for 10 minutes. Do not share this with anyone.</p>
      </div>`
    );

    res.status(200).json({ message: "Registration successful! OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── VERIFY EMAIL OTP ──
const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: "OTP not found. Please register again." });
  if (Date.now() > record.expiresAt) { delete otpStore[email]; return res.status(400).json({ message: "OTP expired." }); }
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

  await User.findOneAndUpdate({ email }, { isVerified: true });
  delete otpStore[email];

  const user = await User.findOne({ email });
  const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(200).json({
    message: "Email verified successfully!", token,
    user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }
  });
};

// ── FORGOT PASSWORD ──
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "No account found with this email." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  try {
    await sendEmail(email, "Password Reset OTP - Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:8px;">
        <h2 style="color:#1a1108;">Shree Chemicals</h2>
        <p style="color:#555;">Your password reset OTP:</p>
        <div style="font-size:36px;font-weight:bold;color:#c8963a;letter-spacing:8px;margin:1rem 0;">${otp}</div>
        <p style="color:#999;font-size:12px;">Valid for 10 minutes.</p>
      </div>`
    );
    res.status(200).json({ message: "OTP sent to email." });
  } catch {
    res.status(500).json({ message: "Failed to send OTP." });
  }
};

// ── VERIFY OTP (forgot password) ──
const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "OTP not found." });
  if (Date.now() > record.expiresAt) { delete otpStore[email]; return res.status(400).json({ message: "OTP expired." }); }
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });
  otpStore[email].verified = true;
  res.status(200).json({ message: "OTP verified!" });
};

// ── RESET PASSWORD ──
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const record = otpStore[email];
  if (!record || !record.verified) return res.status(400).json({ message: "Please verify OTP first." });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashed });
  delete otpStore[email];

  res.status(200).json({ message: "Password reset successfully!" });
};

// ── RESEND VERIFICATION OTP ──
const resendVerifyOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "No account found." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  try {
    await sendEmail(email, "New OTP - Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:8px;">
        <h2 style="color:#1a1108;">Shree Chemicals</h2>
        <p>Your new verification OTP:</p>
        <div style="font-size:36px;font-weight:bold;color:#c8963a;letter-spacing:8px;margin:1rem 0;">${otp}</div>
        <p style="color:#999;font-size:12px;">Valid for 10 minutes.</p>
      </div>`
    );
    res.status(200).json({ message: "OTP resent successfully!" });
  } catch {
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};

// ── GET PROFILE ──
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE PROFILE ──
const updateProfile = async (req, res) => {
  try {
    const {
      firstName, lastName, phone, whatsapp, alternatePhone,
      homeAddress, workAddress, landmark, city, pincode
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName, lastName, phone,
        whatsapp: whatsapp || phone,
        alternatePhone: alternatePhone || "",
        homeAddress, workAddress, landmark, city,
        pincode: pincode || "",
      },
      { new: true, select: "-password" }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        city: updated.city,
        whatsapp: updated.whatsapp,
        alternatePhone: updated.alternatePhone,
        homeAddress: updated.homeAddress,
        workAddress: updated.workAddress,
        landmark: updated.landmark,
        pincode: updated.pincode,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register, verifyEmailOtp, forgotPassword, verifyOtp,
  resetPassword, login, resendVerifyOtp, getProfile, updateProfile
};