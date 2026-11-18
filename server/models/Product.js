const mongoose = require("mongoose");

const weightPriceSchema = new mongoose.Schema({
  weight: { type: String, required: true },  // e.g. "100g"
  price:  { type: Number, required: true },  // e.g. 199
}, { _id: false });

// For candles: size (small/medium/large) with price per candle-category
const sizePriceSchema = new mongoose.Schema({
  size:  { type: String, required: true },  // "small" | "medium" | "large"
  price: { type: Number, required: true },  // price for this size
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },  // base/minimum price (auto-set)
  category:    { type: String, required: true, enum: ["Candles", "Tea", "Incense"] },
  images:      [{ type: String }],
  stock:       { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },

  // Tea-specific
  weightOptions: [weightPriceSchema],

  // Candle-specific
  candleCategory: {
    type: String,
    enum: ["Plain", "Plain + Aroma", "Design", "Design + Aroma", ""],
    default: "",
  },
  fragrance:   { type: String, default: "" },   // e.g. "Rose", "Lavender"
  sizeOptions: [sizePriceSchema],               // small/medium/large with prices

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);