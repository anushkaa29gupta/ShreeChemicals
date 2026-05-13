const express  = require("express");
const router   = express.Router();
const { adminLogin, verifyAdminOtp, getAllUsers, deleteUser } = require("../controllers/adminController");
const { getAllProducts, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const adminAuth = require("../middleware/adminAuth");
const upload    = require("../middleware/upload");

// Auth
router.post("/login",      adminLogin);
router.post("/verify-otp", verifyAdminOtp);

// Products
router.get("/products",         getAllProducts);
router.post("/products",        adminAuth, upload.array("images", 5), addProduct);
router.put("/products/:id",     adminAuth, upload.array("images", 5), updateProduct);
router.delete("/products/:id",  adminAuth, deleteProduct);

// Users
router.get("/users",            adminAuth, getAllUsers);
router.delete("/users/:id",     adminAuth, deleteUser);

module.exports = router;