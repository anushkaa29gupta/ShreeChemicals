const Order     = require("../models/Order");
const User      = require("../models/User");
const Cart      = require("../models/Cart");
const sendEmail = require("../utils/sendEmail");

const STORE_CITY    = "agra";
const STORE_STATE   = "uttar pradesh";
const STORE_PINCODE = "282005";

const UP_CITIES = [
  "agra","meerut","lucknow","kanpur","varanasi","allahabad","prayagraj",
  "ghaziabad","noida","mathura","aligarh","bareilly","moradabad","saharanpur",
  "gorakhpur","firozabad","muzaffarnagar","rampur","shahjahanpur","farrukhabad",
];

const addBusinessDays = (startDate, days) => {
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 1) added++;
  }
  return date;
};

const formatDate = (date) =>
  date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const getDeliveryRange = (customerCity, customerPincode) => {
  const city    = (customerCity    || "").toLowerCase().trim();
  const pincode = (customerPincode || "").trim();
  if (city === STORE_CITY || pincode.startsWith("282"))
    return { min: 4, max: 5,  label: "Same city" };
  if (UP_CITIES.includes(city))
    return { min: 6, max: 7,  label: "Same state" };
  return       { min: 9, max: 12, label: "Other state" };
};

// ── PLACE ORDER (customer) ──────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

    const { min, max } = getDeliveryRange(user.city, user.pincode);
    const today   = new Date();
    const minDate = addBusinessDays(today, min);
    const maxDate = addBusinessDays(today, max);
    const deliveryDate = `${formatDate(minDate)} – ${formatDate(maxDate)}`;

    const order = await Order.create({
      userId: user._id,
      customer: {
        firstName:      user.firstName,
        lastName:       user.lastName,
        email:          user.email,
        phone:          user.phone,
        whatsapp:       user.whatsapp || user.phone,
        alternatePhone: user.alternatePhone || "",
        homeAddress:    user.homeAddress    || "",
        landmark:       user.landmark       || "",
        city:           user.city           || "",
        pincode:        user.pincode        || "",
      },
      items: cart.items.map(i => ({
        productId: i.productId,
        name:      i.name,
        price:     i.price,
        quantity:  i.quantity,
        image:     i.image,
        category:  i.category,
        weight:    i.weight,
      })),
      totalAmount,
      deliveryDate,
      status: "pending",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order placed!", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET ALL ORDERS (admin) ──────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── GET MY ORDERS (customer) ────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── APPROVE ORDER (admin) ───────────────────────────────────────────────────
const approveOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const itemRows = order.items.map(i =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #f0ebe3;">${i.name}${i.weight ? ` (${i.weight})` : ""}</td>
        <td style="padding:8px;border-bottom:1px solid #f0ebe3;text-align:center;">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f0ebe3;text-align:right;">₹${(i.price * i.quantity).toLocaleString()}</td>
      </tr>`
    ).join("");

    await sendEmail(
      order.customer.email,
      "🕯️ Order Confirmed – Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:12px;background:#fffdf9;">
        <h2 style="color:#1a1108;font-family:Georgia,serif;letter-spacing:2px;">SHREE CHEMICALS</h2>
        <p style="color:#27ae60;font-size:18px;font-weight:600;">✅ Your order has been confirmed!</p>
        <p style="color:#555;">Hi ${order.customer.firstName}, thank you for your order. Here's your receipt:</p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
          <thead>
            <tr style="background:#faf7f2;">
              <th style="padding:8px;text-align:left;font-size:11px;letter-spacing:1px;color:#8a7a6a;">ITEM</th>
              <th style="padding:8px;text-align:center;font-size:11px;letter-spacing:1px;color:#8a7a6a;">QTY</th>
              <th style="padding:8px;text-align:right;font-size:11px;letter-spacing:1px;color:#8a7a6a;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 8px;font-weight:700;color:#1a1108;">Total</td>
              <td style="padding:12px 8px;font-weight:700;color:#c8963a;text-align:right;">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background:#faf7f2;padding:1rem;border-radius:8px;margin:1rem 0;">
          <p style="margin:0;color:#555;font-size:13px;">📦 <strong>Delivery Address:</strong><br/>
          ${order.customer.homeAddress}${order.customer.landmark ? `, ${order.customer.landmark}` : ""}, ${order.customer.city} – ${order.customer.pincode}</p>
          <p style="margin:8px 0 0;color:#555;font-size:13px;">🚚 <strong>Expected Delivery:</strong><br/>${order.deliveryDate}</p>
        </div>
        <p style="color:#999;font-size:12px;margin-top:1.5rem;">For any queries, contact us on WhatsApp. Thank you for choosing Shree Chemicals! 🕯️</p>
      </div>`
    );

    res.status(200).json({ message: "Order approved and email sent!", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DECLINE ORDER (admin) ───────────────────────────────────────────────────
const declineOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "declined" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    await sendEmail(
      order.customer.email,
      "Order Update – Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:12px;background:#fffdf9;">
        <h2 style="color:#1a1108;font-family:Georgia,serif;letter-spacing:2px;">SHREE CHEMICALS</h2>
        <p style="color:#c0392b;font-size:18px;font-weight:600;">❌ Your order could not be confirmed</p>
        <p style="color:#555;">Hi ${order.customer.firstName}, unfortunately we were unable to confirm your order of <strong>₹${order.totalAmount.toLocaleString()}</strong>.</p>
        <p style="color:#555;">This may be due to payment not being received. Please reach out to us on WhatsApp to resolve this.</p>
        <div style="background:#fdf0ef;padding:1rem;border-radius:8px;margin:1rem 0;border-left:3px solid #e74c3c;">
          <p style="margin:0;color:#c0392b;font-size:13px;">Try reaching out again to us, happy shopping! 🛍️</p>
        </div>
        <p style="color:#999;font-size:12px;margin-top:1.5rem;">Thank you for choosing Shree Chemicals.</p>
      </div>`
    );

    res.status(200).json({ message: "Order declined and email sent!", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELIVER ORDER (admin) ───────────────────────────────────────────────────
const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "delivered" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const feedbackUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/feedback/${order._id}`;

    const itemRows = order.items.map(i =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #f0ebe3;">${i.name}${i.weight ? ` (${i.weight})` : ""}</td>
        <td style="padding:8px;border-bottom:1px solid #f0ebe3;text-align:center;">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f0ebe3;text-align:right;">₹${(i.price * i.quantity).toLocaleString()}</td>
      </tr>`
    ).join("");

    await sendEmail(
      order.customer.email,
      "📦 Order Delivered – Share Your Feedback | Shree Chemicals",
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:12px;background:#fffdf9;">
        <h2 style="color:#1a1108;font-family:Georgia,serif;letter-spacing:2px;">SHREE CHEMICALS</h2>
        <p style="color:#27ae60;font-size:18px;font-weight:600;">📦 Your order has been delivered!</p>
        <p style="color:#555;">Hi ${order.customer.firstName}, we hope you love your purchase. Here's a summary of what was delivered:</p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
          <thead>
            <tr style="background:#faf7f2;">
              <th style="padding:8px;text-align:left;font-size:11px;letter-spacing:1px;color:#8a7a6a;">ITEM</th>
              <th style="padding:8px;text-align:center;font-size:11px;letter-spacing:1px;color:#8a7a6a;">QTY</th>
              <th style="padding:8px;text-align:right;font-size:11px;letter-spacing:1px;color:#8a7a6a;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 8px;font-weight:700;color:#1a1108;">Total Paid</td>
              <td style="padding:12px 8px;font-weight:700;color:#c8963a;text-align:right;">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background:#faf7f2;padding:1.5rem;border-radius:10px;margin:1.5rem 0;text-align:center;border:1px solid #e0d5c5;">
          <p style="color:#1a1108;font-size:16px;font-weight:600;margin:0 0 6px;">We'd love your feedback! 🌟</p>
          <p style="color:#8a7a6a;font-size:13px;margin:0 0 1.2rem;">It only takes 30 seconds and helps us serve you better.</p>
          <a href="${feedbackUrl}"
             style="display:inline-block;padding:12px 32px;background:#c8963a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.5px;">
            ⭐ Rate Your Experience
          </a>
        </div>
        <p style="color:#999;font-size:12px;margin-top:1.5rem;text-align:center;">
          Thank you for choosing Shree Chemicals! We look forward to serving you again. 🕯️
        </p>
      </div>`
    );

    res.status(200).json({ message: "Order marked as delivered and email sent!", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── SUBMIT FEEDBACK (customer via link) ────────────────────────────────────
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { feedback: { rating, comment, givenAt: new Date() } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const stars = "⭐".repeat(rating) + "☆".repeat(5 - rating);
    await sendEmail(
      process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      `⭐ New Feedback (${rating}/5) – ${order.customer.firstName} ${order.customer.lastName}`,
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;border:1px solid #e0d5c5;border-radius:12px;background:#fffdf9;">
        <h2 style="color:#1a1108;font-family:Georgia,serif;letter-spacing:2px;">SHREE CHEMICALS — Feedback Received</h2>
        <p style="font-size:28px;margin:0.5rem 0;">${stars}</p>
        <p style="color:#555;font-size:16px;"><strong>${order.customer.firstName} ${order.customer.lastName}</strong> rated their order <strong>${rating}/5</strong></p>
        ${comment ? `<div style="background:#faf7f2;padding:1rem;border-radius:8px;border-left:3px solid #c8963a;margin:1rem 0;color:#555;font-size:14px;">"${comment}"</div>` : "<p style='color:#aaa;font-size:13px;'>No written comment left.</p>"}
        <hr style="border:none;border-top:1px solid #e0d5c5;margin:1.2rem 0;"/>
        <p style="color:#8a7a6a;font-size:13px;">Order: #${order._id.toString().slice(-6).toUpperCase()} · ₹${order.totalAmount.toLocaleString()} · ${order.customer.city}</p>
      </div>`
    );

    res.status(200).json({ message: "Feedback submitted! Thank you." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE FEEDBACK (admin) ─────────────────────────────────────────────────
const deleteFeedback = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $unset: { feedback: "" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── CLEAR ALL ORDERS (admin) ────────────────────────────────────────────────
const clearAllOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({ status: { $in: ["delivered", "declined"] } });
    res.status(200).json({
      message: `Cleared ${result.deletedCount} past order(s).`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET ALL FEEDBACKS (public) ──────────────────────────────────────────────
const getAllFeedbacks = async (req, res) => {
  try {
    const orders = await Order.find({
      "feedback.rating": { $exists: true, $ne: null },
    })
      .sort({ "feedback.givenAt": -1 })
      .select("customer items totalAmount feedback");
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};