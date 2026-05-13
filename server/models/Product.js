const mongoose = require("mongoose");

const weightPriceSchema = new mongoose.Schema({
  weight: { type: String, required: true },  // e.g. "100g"
  price:  { type: Number, required: true },  // e.g. 199
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },  // keep as default/base price
  category:    { type: String, required: true, enum: ["Candles", "Tea", "Incense"] },
  images:      [{ type: String }],
  stock:       { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  // Tea-specific: weight options with individual prices
  weightOptions: [weightPriceSchema],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);