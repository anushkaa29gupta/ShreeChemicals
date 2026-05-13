const Cart = require("../models/Cart");

// GET cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.status(200).json(cart || { items: [] });
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ADD item — same product + different weight = separate row
const addToCart = async (req, res) => {
  const { productId, name, price, image, category, weight, isStatic } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    // Match by BOTH productId AND weight so 100g and 250g are separate rows
    const existing = cart.items.find(
      (i) => i.productId === productId && i.weight === (weight || "")
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({
        productId,
        name,
        price: Number(price),
        image: image || "",
        category: category || "",
        weight: weight || "",
        isStatic: isStatic || false,
        quantity: 1,
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// REMOVE item by cart item _id
const removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    res.status(200).json(cart);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// UPDATE quantity by cart item _id
const updateQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.find((i) => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.status(200).json(cart);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// CLEAR cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) { cart.items = []; await cart.save(); }
    res.status(200).json({ message: "Cart cleared" });
  } catch { res.status(500).json({ message: "Server error" }); }
};

module.exports = { getCart, addToCart, removeFromCart, updateQuantity, clearCart };