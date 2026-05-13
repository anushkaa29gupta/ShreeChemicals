const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

// ADD this after cart routes
const orderRoutes = require("./routes/order");
app.use("/api/orders", orderRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error:", err));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

const feedbackRoutes = require("./routes/feedback");
app.use("/api/feedback", feedbackRoutes);