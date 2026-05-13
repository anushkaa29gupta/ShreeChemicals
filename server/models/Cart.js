const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId:  { type: String, required: true },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  image:      { type: String, default: "" },
  category:   { type: String, default: "" },
  weight:     { type: String, default: "" },
  isStatic:   { type: Boolean, default: false },
  quantity:   { type: Number, default: 1, min: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items:  [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);