const Feedback = require("../models/Feedback");
const Order = require("../models/Order");

// GET /api/feedback — public, all submitted feedbacks
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ submitted: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
};

// GET /api/feedback/:orderId — get feedback form data (order info for pre-fill)
const getFeedbackForm = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.product",
      "name images"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if already submitted
    const existing = await Feedback.findOne({ orderId: req.params.orderId });
    if (existing && existing.submitted) {
      return res.json({ alreadySubmitted: true });
    }

    res.json({
      orderId: order._id,
      userName: order.userName || "",
      userEmail: order.userEmail || "",
      products: (order.items || []).map((item) => ({
        name: item.product?.name || item.name || "Product",
        image: item.product?.images?.[0] || "",
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// POST /api/feedback/:orderId — submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment, userName, userEmail, products, userId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    // Prevent duplicate submission
    const existing = await Feedback.findOne({ orderId: req.params.orderId });
    if (existing && existing.submitted) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        orderId: req.params.orderId,
        userId,
        userName,
        userEmail,
        rating,
        comment,
        products,
        submitted: true,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

module.exports = { getAllFeedbacks, getFeedbackForm, submitFeedback };