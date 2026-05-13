const express = require("express");
const router = express.Router();
const {
  getAllFeedbacks,
  getFeedbackForm,
  submitFeedback,
} = require("../controllers/feedbackController");

// Public: get all submitted feedbacks (for /feedback page)
router.get("/", getAllFeedbacks);

// Get order info for feedback form (from email link)
router.get("/:orderId", getFeedbackForm);

// Submit feedback
router.post("/:orderId", submitFeedback);

module.exports = router;