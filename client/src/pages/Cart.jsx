import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Cart.css";
import "./OrderConfirmation.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const loadCart = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCart(data.items || []);
      } catch { console.error("Failed to fetch cart"); }
      setLoading(false);
    };
    loadCart();
  }, [token]);

  const handleRemove = async (itemId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(prev => prev.filter(i => i._id !== itemId));
    } catch { console.error("Failed to remove"); }
  };

  const handleQuantity = async (itemId, quantity) => {
    if (quantity < 1) { handleRemove(itemId); return; }
    try {
      await fetch(`http://localhost:5000/api/cart/update/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      setCart(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
    } catch { console.error("Failed to update"); }
  };

  const handleClear = async () => {
    try {
      await fetch("http://localhost:5000/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart([]);
    } catch { console.error("Failed to clear"); }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/orders/place", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCart([]);
        navigate("/order-confirmation", {
          state: {
            order: {
              items: cart,
              totalAmount: total,
            },
          },
        });
      } else {
        setCheckoutMsg(data.message || "Something went wrong.");
      }
    } catch { setCheckoutMsg("Server error. Try again."); }
    setCheckoutLoading(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── NOT LOGGED IN ──
  if (!token) {
    return (
      <div>
        <Navbar cartCount={0} />
        <div className="cart-empty-wrap">
          <div className="cart-empty-box">
            <div className="cart-candle-wrap">
              <div className="cart-flame"></div>
              <div className="cart-candle-body"></div>
            </div>
            <h2>Your cart is waiting</h2>
            <p className="cart-quote">"Every great collection begins with a single flame."</p>
            <p className="cart-login-msg">Please sign in to add items and view your cart.</p>
            <button className="cart-login-btn" onClick={() => navigate("/login")}>
              Sign In to Continue →
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── LOGGED IN — CART UI ──
  return (
    <div>
      <Navbar cartCount={totalItems} />
      <div className="cart-page">

        <div className="cart-header">
          <div>
            <h1>Your Cart</h1>
            <p>Welcome back, {user?.firstName} 🕯️</p>
          </div>
          {cart.length > 0 && (
            <button className="cart-clear-btn" onClick={handleClear}>Clear All</button>
          )}
        </div>

        {loading ? (
          <div className="cart-loading">Loading your cart...</div>

        ) : cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-candle-wrap small">
              <div className="cart-flame"></div>
              <div className="cart-candle-body"></div>
            </div>
            <h3>Your cart is empty</h3>
            <p>"The finest fragrances await your discovery."</p>
            <button onClick={() => navigate("/")}>Explore Products →</button>
          </div>

        ) : (
          <div className="cart-layout">

            {/* CART ITEMS */}
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div className="cart-item-img-wrap">
                    {item.image ? (
                      <img
                        src={item.isStatic ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.name}
                        className="cart-item-img"
                      />
                    ) : (
                      <div className="cart-item-no-img">🕯️</div>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <div>
                        {item.category && (
                          <span className="cart-item-cat">{item.category}</span>
                        )}
                        <h3 className="cart-item-name">{item.name}</h3>
                        {item.weight && (
                          <span className="cart-item-weight-badge">{item.weight}</span>
                        )}
                        <p className="cart-item-price">₹{item.price} each</p>
                      </div>
                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemove(item._id)}
                        title="Remove item"
                      >✕</button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="qty-control">
                        <button onClick={() => handleQuantity(item._id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <p className="cart-item-subtotal">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="cart-summary">
              <div className="summary-candle">
                <div className="cart-flame small"></div>
                <div className="cart-candle-body small"></div>
              </div>
              <h3>Order Summary</h3>

              <div className="summary-rows">
                {cart.map((item) => (
                  <div className="summary-row" key={item._id}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="free">FREE</span>
                </div>
                <div className="summary-row total">
                  <span>Total ({totalItems} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button className="checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? "Placing Order..." : "Proceed to Checkout →"}
              </button>
              {checkoutMsg && (
                <p className={`checkout-msg ${checkoutMsg.includes("✅") ? "success" : "error"}`}>
                  {checkoutMsg}
                </p>
              )}

              <p className="summary-note">
                🔒 Secure checkout · Free delivery on all orders
              </p>

              <div className="summary-quote">
                "Crafted with care, delivered with love."
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;