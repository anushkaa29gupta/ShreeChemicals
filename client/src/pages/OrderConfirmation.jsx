import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Order data passed via navigate state, or fallback
  const order = location.state?.order || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="oc-root">
      <Navbar cartCount={0} />

      {/* ── HERO ── */}
      <div className="oc-hero">
        <div className="oc-hero-blob ob1" />
        <div className="oc-hero-blob ob2" />
        <div className="oc-hero-blob ob3" />

        <div className="oc-hero-inner">
          <div className="oc-check-ring">
            <svg className="oc-checkmark" viewBox="0 0 52 52" fill="none">
              <circle className="oc-check-circle" cx="26" cy="26" r="24" />
              <path className="oc-check-tick" d="M14 26l8 8 16-16" />
            </svg>
          </div>

          <h1 className="oc-hero-title">Order Placed!</h1>
          <p className="oc-hero-sub">Thank you for shopping with us 🕯️</p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="oc-body">

        {/* WhatsApp notice card */}
        <div className="oc-whatsapp-card">
          <div className="oc-wa-icon-wrap">
            <svg className="oc-wa-icon" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#25D366"/>
              <path
                d="M22.5 19.9c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.77.99-.95 1.19-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.24-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.05 2.85 1.2 3.05.14.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.67.61.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.19-.57-.34z"
                fill="#fff"
              />
              <path
                d="M16.004 6C10.478 6 6 10.478 6 16.004c0 1.78.468 3.45 1.285 4.9L6 26l5.24-1.265A9.96 9.96 0 0016.004 26C21.53 26 26 21.522 26 16.004 26 10.478 21.53 6 16.004 6zm0 18.182a8.166 8.166 0 01-4.16-1.138l-.298-.178-3.09.745.77-3.01-.195-.31A8.132 8.132 0 017.818 16c0-4.515 3.672-8.182 8.186-8.182 4.515 0 8.182 3.667 8.182 8.182 0 4.514-3.667 8.182-8.182 8.182z"
                fill="#fff"
              />
            </svg>
          </div>

          <div className="oc-wa-content">
            <h2 className="oc-wa-title">Stay tuned on WhatsApp!</h2>
            <p className="oc-wa-msg">
              Our owner will reach out to you shortly on WhatsApp for payment details and to confirm your order.
              Please keep your WhatsApp notifications on. 📲
            </p>

            <div className="oc-wa-steps">
              <div className="oc-wa-step">
                <span className="oc-step-num">1</span>
                <span>We review your order</span>
              </div>
              <div className="oc-step-arrow">→</div>
              <div className="oc-wa-step">
                <span className="oc-step-num">2</span>
                <span>Owner WhatsApps you</span>
              </div>
              <div className="oc-step-arrow">→</div>
              <div className="oc-wa-step">
                <span className="oc-step-num">3</span>
                <span>You pay &amp; we ship!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary — only renders if order data was passed */}
        {order && (
          <div className="oc-summary-card">
            <h3 className="oc-summary-title">📋 Order Summary</h3>
            <div className="oc-summary-items">
              {order.items?.map((item, i) => (
                <div key={i} className="oc-summary-row">
                  <span className="oc-summary-name">
                    {item.name}{item.weight ? ` · ${item.weight}` : ""}
                  </span>
                  <span className="oc-summary-qty">×{item.quantity}</span>
                  <span className="oc-summary-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            <div className="oc-summary-total">
              <span>Total</span>
              <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="oc-actions">
          {/* Pass tab:'orders' so Profile.jsx opens on the My Orders tab */}
          <button
            className="oc-btn-orders"
            onClick={() => navigate("/profile", { state: { tab: "orders" } })}
          >
            📦 View My Orders
          </button>
          <button className="oc-btn-shop" onClick={() => navigate("/")}>
            🛍️ Continue Shopping
          </button>
        </div>

        {/* Reassurance strip */}
        <div className="oc-reassure">
          <div className="oc-reassure-item">
            <span className="oc-reassure-icon">🔒</span>
            <span>Secure &amp; Trusted</span>
          </div>
          <div className="oc-reassure-divider" />
          <div className="oc-reassure-item">
            <span className="oc-reassure-icon">🚚</span>
            <span>Fast Delivery</span>
          </div>
          <div className="oc-reassure-divider" />
          <div className="oc-reassure-item">
            <span className="oc-reassure-icon">💬</span>
            <span>WhatsApp Support</span>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;