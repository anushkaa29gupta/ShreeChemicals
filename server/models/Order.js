const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name:      String,
  price:     Number,
  quantity:  Number,
  image:     String,
  category:  String,
  weight:    String,
});

const orderSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: {
    firstName:      String,
    lastName:       String,
    email:          String,
    phone:          String,
    whatsapp:       String,
    alternatePhone: String,
    homeAddress:    String,
    landmark:       String,
    city:           String,
    pincode:        String,
  },
  items:        [orderItemSchema],
  totalAmount:  { type: Number, required: true },
  status:       {
    type:    String,
    enum:    ["pending", "approved", "declined", "delivered"],
    default: "pending",
  },
  deliveryDate: { type: String },
  adminNote:    { type: String },
  feedback: {
    rating:  { type: Number, min: 1, max: 5 },
    comment: { type: String },
    givenAt: { type: Date },
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);