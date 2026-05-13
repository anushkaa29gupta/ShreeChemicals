const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const { getCart, addToCart, removeFromCart, updateQuantity, clearCart } = require("../controllers/cartController");

router.get("/", userAuth, getCart);
router.post("/add", userAuth, addToCart);
router.delete("/remove/:itemId", userAuth, removeFromCart);
router.put("/update/:itemId", userAuth, updateQuantity);
router.delete("/clear", userAuth, clearCart);

module.exports = router;