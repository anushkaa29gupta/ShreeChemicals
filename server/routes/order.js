const express   = require("express");
const router    = express.Router();
const userAuth  = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");
const {
  placeOrder,
  getAllOrders,
  getMyOrders,
  approveOrder,
  declineOrder,
  deliverOrder,
  submitFeedback,
  deleteFeedback,
  clearAllOrders,
  getAllFeedbacks,
} = require("../controllers/orderController");

router.post("/place",          userAuth,  placeOrder);
router.get("/my",              userAuth,  getMyOrders);
router.get("/all",             adminAuth, getAllOrders);
router.put("/approve/:id",     adminAuth, approveOrder);
router.put("/decline/:id",     adminAuth, declineOrder);
router.put("/deliver/:id",     adminAuth, deliverOrder);
router.delete("/clear-all",    adminAuth, clearAllOrders);

// Feedback — public submit, admin delete
router.get("/feedbacks",                          getAllFeedbacks);
router.post("/feedback/:id",                      submitFeedback);
router.delete("/feedback/:id", adminAuth,         deleteFeedback);

module.exports = router;