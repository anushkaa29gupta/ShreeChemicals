const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const Admin  = require("../models/Admin");
const User   = require("../models/User");
const Order  = require("../models/Order");
const sendEmail = require("../utils/sendEmail");

const otpStore = {};

// ── ADMIN LOGIN ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "No admin found with this email." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendEmail(email, "Admin OTP - Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:8px;">
        <h2 style="color:#1a1108;">Admin Access OTP</h2>
        <p>Your admin login OTP:</p>
        <div style="font-size:36px;font-weight:bold;color:#c8963a;letter-spacing:8px;margin:1rem 0;">${otp}</div>
        <p style="color:#999;font-size:12px;">Valid for 10 minutes. Do not share.</p>
      </div>`
    );

    res.status(200).json({ message: "OTP sent to admin email." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// ── VERIFY ADMIN OTP ─────────────────────────────────────────────────────────
const verifyAdminOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "OTP not found." });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired." });
  }
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

  delete otpStore[email];
  const admin = await Admin.findOne({ email });
  const token = jwt.sign(
    { id: admin._id, email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ message: "Admin verified!", token, admin: { id: admin._id, name: admin.name, email } });
};

// ── GET ALL USERS (admin) ────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    // For each user, get order count and total spent
    const userIds = users.map(u => u._id);
    const orders  = await Order.find({ userId: { $in: userIds } })
      .select("userId totalAmount status");

    const statsMap = {};
    orders.forEach(o => {
      const id = o.userId.toString();
      if (!statsMap[id]) statsMap[id] = { orderCount: 0, totalSpent: 0 };
      statsMap[id].orderCount += 1;
      if (o.status === "delivered") statsMap[id].totalSpent += o.totalAmount;
    });

    const result = users.map(u => ({
      ...u.toObject(),
      orderCount: statsMap[u._id.toString()]?.orderCount || 0,
      totalSpent: statsMap[u._id.toString()]?.totalSpent || 0,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── DELETE USER (admin) ──────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: `User ${user.firstName} ${user.lastName} deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { adminLogin, verifyAdminOtp, getAllUsers, deleteUser };