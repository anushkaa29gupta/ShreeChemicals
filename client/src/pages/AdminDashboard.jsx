import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const CATEGORIES = ["Candles", "Tea", "Incense"];
const WEIGHT_OPTS = ["100g", "250g", "500g", "1kg"];
const categoryIcon = { Candles: "🕯️", Tea: "🍵", Incense: "🌿" };

// ── HOOK: live order notifications (polls every 30s) ─────────────────────────
const useOrderNotifications = (token) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevTotalRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const fetchCounts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orders = await res.json();
        if (!Array.isArray(orders)) return;

        const pending = orders.filter(o => o.status === "pending").length;
        const total   = orders.length;

        setPendingCount(pending);

        if (prevTotalRef.current !== null && total > prevTotalRef.current) {
          setNewOrderAlert(true);
          try {
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
            osc.start();
            osc.stop(ctx.currentTime + 0.7);
          } catch { /* AudioContext not available */ }
        }
        prevTotalRef.current = total;
      } catch { /* Network error — retry next interval */ }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return { pendingCount, newOrderAlert, dismissAlert: () => setNewOrderAlert(false) };
};

// ── NEW ORDER TOAST ──────────────────────────────────────────────────────────
const NewOrderToast = ({ onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="adm-toast">
      <span className="adm-toast-icon">🛍️</span>
      <div className="adm-toast-body">
        <strong>New Order Received!</strong>
        <p>Check the Orders tab to review.</p>
      </div>
      <button className="adm-toast-close" onClick={onDismiss}>×</button>
    </div>
  );
};

// ── ORDERS TAB ───────────────────────────────────────────────────────────────
const OrdersTab = ({ token }) => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);

  const loadOrders = async () => {
    try {
      const res  = await fetch("http://localhost:5000/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch {
      setActionMsg("Failed to load orders.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => { await loadOrders(); };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (orderId, action) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/orders/${action}/${orderId}`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const nextStatus =
          action === "approve" ? "approved" :
          action === "decline" ? "declined" :
          action === "deliver" ? "delivered" : action;

        setOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, status: nextStatus } : o)
        );
        setActionMsg(data.message);
      }
    } catch {
      setActionMsg("Action failed.");
    }
  };

  const handleClearAll = async () => {
    try {
      const res  = await fetch("http://localhost:5000/api/orders/clear-all", {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message);
        setClearConfirm(false);
        loadOrders();
      }
    } catch {
      setActionMsg("Failed to clear orders.");
    }
  };

  const openWhatsApp = (order) => {
    const phone = (order.customer.whatsapp || order.customer.phone || "").replace(/\D/g, "");
    const items = order.items
      .map(i => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`)
      .join("\n");
    const msg = encodeURIComponent(
      `Hello ${order.customer.firstName}! 🕯️\n\nThank you for your order at Shree Chemicals.\n\n*Order Summary:*\n${items}\n\n*Total: ₹${order.totalAmount}*\n\nPlease complete your payment by scanning our QR code. Once payment screenshot is received, we'll confirm your order.\n\nExpected delivery: ${order.deliveryDate}\n\nThank you! 🙏`
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
  };

  const statusColor = {
    pending:   "#f39c12",
    approved:  "#27ae60",
    declined:  "#e74c3c",
    delivered: "#8e44ad",
  };

  const hasPastOrders = orders.some(o => o.status === "delivered" || o.status === "declined");

  if (loading) return <div className="adm-loading">Loading orders…</div>;

  return (
    <div className="adm-orders-wrap">
      {actionMsg && (
        <div className="adm-message" onClick={() => setActionMsg("")}>{actionMsg} ✕</div>
      )}

      {orders.length > 0 && (
        <div className="adm-orders-summary">
          <div className="adm-orders-stat">
            <span className="adm-orders-stat-num">{orders.length}</span>
            <span className="adm-orders-stat-label">Total</span>
          </div>
          <div className="adm-orders-stat">
            <span className="adm-orders-stat-num" style={{ color: "#f39c12" }}>
              {orders.filter(o => o.status === "pending").length}
            </span>
            <span className="adm-orders-stat-label">Pending</span>
          </div>
          <div className="adm-orders-stat">
            <span className="adm-orders-stat-num" style={{ color: "#27ae60" }}>
              {orders.filter(o => o.status === "approved").length}
            </span>
            <span className="adm-orders-stat-label">Approved</span>
          </div>
          <div className="adm-orders-stat">
            <span className="adm-orders-stat-num" style={{ color: "#8e44ad" }}>
              {orders.filter(o => o.status === "delivered").length}
            </span>
            <span className="adm-orders-stat-label">Delivered</span>
          </div>
          <div className="adm-orders-stat">
            <span className="adm-orders-stat-num" style={{ color: "#e74c3c" }}>
              {orders.filter(o => o.status === "declined").length}
            </span>
            <span className="adm-orders-stat-label">Declined</span>
          </div>
        </div>
      )}

      {hasPastOrders && (
        <div className="adm-clear-row">
          {clearConfirm ? (
            <div className="adm-clear-confirm">
              <span>This will remove all delivered &amp; declined orders. Sure?</span>
              <button className="adm-clear-yes-btn" onClick={handleClearAll}>Yes, Clear</button>
              <button className="adm-btn-cancel" onClick={() => setClearConfirm(false)}>Cancel</button>
            </div>
          ) : (
            <button className="adm-clear-all-btn" onClick={() => setClearConfirm(true)}>
              🗑️ Clear Past Orders
            </button>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="adm-empty"><p>No orders yet.</p></div>
      ) : (
        orders.map(order => (
          <div className="adm-order-card" key={order._id}>
            <div className="adm-order-header">
              <div>
                <span className="adm-order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                <span className="adm-order-date">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              <span
                className="adm-order-status"
                style={{
                  color:  statusColor[order.status],
                  border: `1px solid ${statusColor[order.status]}`,
                }}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="adm-order-body">
              <div className="adm-order-customer">
                <h4>👤 Customer</h4>
                <p><strong>{order.customer.firstName} {order.customer.lastName}</strong></p>
                <p>📧 {order.customer.email}</p>
                <p>📞 {order.customer.phone}</p>
                {order.customer.alternatePhone && <p>📞 Alt: {order.customer.alternatePhone}</p>}
                <p>💬 WhatsApp: {order.customer.whatsapp || order.customer.phone}</p>
                <p>🏠 {order.customer.homeAddress}{order.customer.landmark ? `, ${order.customer.landmark}` : ""}</p>
                <p>🏙️ {order.customer.city} – {order.customer.pincode}</p>
                <p>🚚 Delivery by: <strong>{order.deliveryDate}</strong></p>
              </div>

              <div className="adm-order-items">
                <h4>🛒 Items</h4>
                {order.items.map((item, i) => (
                  <div key={i} className="adm-order-item-row">
                    <span>{item.name}{item.weight ? ` (${item.weight})` : ""}</span>
                    <span>×{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="adm-order-total">
                  Total: ₹{order.totalAmount.toLocaleString()}
                </div>

                {order.feedback?.rating && (
                  <div className="adm-order-feedback">
                    <span className="adm-feedback-stars">
                      {"⭐".repeat(order.feedback.rating)}{"☆".repeat(5 - order.feedback.rating)}
                    </span>
                    {order.feedback.comment && (
                      <p className="adm-feedback-comment">"{order.feedback.comment}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="adm-order-actions">
              <button className="adm-wa-btn" onClick={() => openWhatsApp(order)}>
                💬 Send WhatsApp QR
              </button>

              {order.status === "pending" && (
                <>
                  <button className="adm-approve-btn" onClick={() => handleAction(order._id, "approve")}>
                    ✅ Approve Order
                  </button>
                  <button className="adm-decline-btn" onClick={() => handleAction(order._id, "decline")}>
                    ❌ Decline Order
                  </button>
                </>
              )}

              {order.status === "approved" && (
                <button className="adm-deliver-btn" onClick={() => handleAction(order._id, "deliver")}>
                  🚚 Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ── FEEDBACK TAB ─────────────────────────────────────────────────────────────
const FeedbackTab = ({ token }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/orders/feedbacks");
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Failed to load feedbacks.");
    }
    setLoading(false);
  };

  useEffect(() => { const init = async () => { await loadFeedbacks(); }; init(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (orderId) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/orders/feedback/${orderId}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setDeleteConfirm(null);
        setFeedbacks(prev => prev.filter(f => f._id !== orderId));
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.feedback.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star:  r,
    count: feedbacks.filter(f => f.feedback.rating === r).length,
  }));

  if (loading) return <div className="adm-loading">Loading reviews…</div>;

  return (
    <div className="adm-feedback-wrap">
      {message && (
        <div className="adm-message" onClick={() => setMessage("")}>{message} ✕</div>
      )}

      {/* ── Stats bar ── */}
      {feedbacks.length > 0 && (
        <div className="adm-fb-stats">
          <div className="adm-fb-avg">
            <span className="adm-fb-avg-num">{avgRating}</span>
            <div>
              <div className="adm-fb-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= Math.round(avgRating) ? "adm-star filled" : "adm-star"}>★</span>
                ))}
              </div>
              <span className="adm-fb-count">{feedbacks.length} verified review{feedbacks.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="adm-fb-bars">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="adm-fb-bar-row">
                <span className="adm-fb-bar-label">{star}★</span>
                <div className="adm-fb-bar-track">
                  <div
                    className="adm-fb-bar-fill"
                    style={{ width: feedbacks.length ? `${(count / feedbacks.length) * 100}%` : "0%" }}
                  />
                </div>
                <span className="adm-fb-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="adm-empty">
          <p>⭐ No reviews yet.</p>
          <p>Reviews appear here once customers submit feedback.</p>
        </div>
      ) : (
        <div className="adm-fb-grid">
          {feedbacks.map(order => {
            const { feedback, customer, items } = order;
            const initials = `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`.toUpperCase();
            const productName = items?.[0]?.name || "Product";

            return (
              <div className="adm-fb-card" key={order._id}>
                {/* Top accent bar */}
                <div className="adm-fb-card-accent" />

                <div className="adm-fb-card-header">
                  <div className="adm-fb-avatar">{initials}</div>
                  <div className="adm-fb-meta">
                    <strong className="adm-fb-name">
                      {customer.firstName} {customer.lastName}
                    </strong>
                    <span className="adm-fb-date">
                      {feedback.givenAt
                        ? new Date(feedback.givenAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="adm-fb-card-stars">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={s <= feedback.rating ? "adm-star filled" : "adm-star"}>★</span>
                    ))}
                  </div>
                </div>

                {feedback.comment && (
                  <div className="adm-fb-comment">
                    <p>"{feedback.comment}"</p>
                  </div>
                )}

                <div className="adm-fb-footer">
                  <span className="adm-fb-product-tag">{productName}</span>
                  <span className="adm-fb-city">📍 {customer.city || "—"}</span>
                  <button
                    className="adm-fb-delete-btn"
                    onClick={() => setDeleteConfirm(order._id)}
                    title="Delete this review"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <h3>Delete Review?</h3>
            <p>This will remove the review from the public feedback page immediately.</p>
            <div className="adm-modal-actions">
              <button className="adm-btn-delete" onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
              <button className="adm-btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── USERS TAB ────────────────────────────────────────────────────────────────
const UsersTab = ({ token }) => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState("");
  const [search, setSearch]       = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Failed to load users.");
    }
    setLoading(false);
  };

  useEffect(() => { const init = async () => { await loadUsers(); }; init(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (userId) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setDeleteConfirm(null);
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.city || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  const totalRevenue = users.reduce((s, u) => s + (u.totalSpent || 0), 0);

  if (loading) return <div className="adm-loading">Loading users…</div>;

  return (
    <div className="adm-users-wrap">
      {message && (
        <div className="adm-message" onClick={() => setMessage("")}>{message} ✕</div>
      )}

      {/* ── Summary strip ── */}
      <div className="adm-users-summary">
        <div className="adm-orders-stat">
          <span className="adm-orders-stat-num">{users.length}</span>
          <span className="adm-orders-stat-label">Total Users</span>
        </div>
        <div className="adm-orders-stat">
          <span className="adm-orders-stat-num" style={{ color: "#27ae60" }}>
            {users.filter(u => u.orderCount > 0).length}
          </span>
          <span className="adm-orders-stat-label">Have Orders</span>
        </div>
        <div className="adm-orders-stat">
          <span className="adm-orders-stat-num" style={{ color: "#c8963a" }}>
            ₹{totalRevenue.toLocaleString()}
          </span>
          <span className="adm-orders-stat-label">Total Revenue</span>
        </div>
        <div className="adm-orders-stat">
          <span className="adm-orders-stat-num" style={{ color: "#8e44ad" }}>
            {users.filter(u => u.orderCount === 0).length}
          </span>
          <span className="adm-orders-stat-label">No Orders Yet</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="adm-users-search-row">
        <input
          className="adm-users-search"
          placeholder="🔍 Search by name, email, city or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="adm-users-search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty">
          <p>No users found{search ? ` for "${search}"` : ""}.</p>
        </div>
      ) : (
        <div className="adm-table-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Spent</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const initials = `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <tr key={u._id}>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-user-avatar">{initials}</div>
                        <div>
                          <div className="adm-product-name">{u.firstName} {u.lastName}</div>
                          <div className="adm-product-desc">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-product-name">{u.phone}</div>
                      {u.whatsapp && u.whatsapp !== u.phone && (
                        <div className="adm-product-desc">💬 {u.whatsapp}</div>
                      )}
                    </td>
                    <td>
                      <div className="adm-product-name">{u.city || "—"}</div>
                      {u.pincode && <div className="adm-product-desc">{u.pincode}</div>}
                    </td>
                    <td>
                      <span className={`adm-user-order-count ${u.orderCount > 0 ? "has-orders" : ""}`}>
                        {u.orderCount}
                      </span>
                    </td>
                    <td className="adm-price">
                      {u.totalSpent > 0 ? `₹${u.totalSpent.toLocaleString()}` : "—"}
                    </td>
                    <td>
                      <div className="adm-product-desc">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </td>
                    <td>
                      <button
                        className="adm-btn-delete"
                        onClick={() => setDeleteConfirm(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <h3>Delete User?</h3>
            <p>
              This will permanently remove{" "}
              <strong>
                {users.find(u => u._id === deleteConfirm)?.firstName}{" "}
                {users.find(u => u._id === deleteConfirm)?.lastName}
              </strong>
              's account. Their past orders will remain in the system.
            </p>
            <div className="adm-modal-actions">
              <button className="adm-btn-delete" onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
              <button className="adm-btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage]         = useState("");
  const [activeTab, setActiveTab]     = useState("products");

  const admin = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const token = localStorage.getItem("adminToken");

  const { pendingCount, newOrderAlert, dismissAlert } = useOrderNotifications(token);

  const emptyForm = {
    name: "", description: "", price: "",
    category: "", stock: "", isAvailable: true,
    weightOptions: [],
    existingImages: [],
    imageFiles: [],
    allPreviews: [],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch("http://localhost:5000/api/admin/products");
        const data = await res.json();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setMessage("Failed to load products.");
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setMessage("Failed to load products.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageAdd = (e) => {
    const incoming     = Array.from(e.target.files);
    const totalAllowed = 5 - form.allPreviews.length;
    if (totalAllowed <= 0) { setMessage("Maximum 5 images allowed."); return; }
    const toAdd       = incoming.slice(0, totalAllowed);
    const newPreviews = toAdd.map((f, i) => ({
      type: "new",
      src:  URL.createObjectURL(f),
      fileIndex: form.imageFiles.length + i,
    }));
    setForm(prev => ({
      ...prev,
      imageFiles:  [...prev.imageFiles, ...toAdd],
      allPreviews: [...prev.allPreviews, ...newPreviews],
    }));
    e.target.value = "";
  };

  const handleImageRemove = (idx) => {
    setForm(prev => {
      const removed        = prev.allPreviews[idx];
      const newAllPreviews = prev.allPreviews.filter((_, i) => i !== idx);
      if (removed.type === "existing") {
        const newExisting = prev.existingImages.filter(p => p !== removed.serverPath);
        return { ...prev, allPreviews: newAllPreviews, existingImages: newExisting };
      } else {
        const newFiles  = prev.imageFiles.filter((_, fi) => fi !== removed.fileIndex);
        let newFileCounter = 0;
        const reIndexed = newAllPreviews.map(p => {
          if (p.type === "new") return { ...p, fileIndex: newFileCounter++ };
          return p;
        });
        return { ...prev, allPreviews: reIndexed, imageFiles: newFiles };
      }
    });
  };

  const handleImageMove = (idx, direction) => {
    setForm(prev => {
      const arr     = [...prev.allPreviews];
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return { ...prev, allPreviews: arr };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.category === "Tea") {
      if (form.weightOptions.length === 0) { setMessage("Please add at least one weight option for Tea."); return; }
      if (form.weightOptions.some(w => !w.price || w.price === "")) { setMessage("Please enter a price for every selected weight option."); return; }
    }
    if (form.allPreviews.length === 0) { setMessage("Please upload at least one image."); return; }

    const formData = new FormData();
    formData.append("name",        form.name);
    formData.append("description", form.description);
    const basePrice = form.category === "Tea"
      ? Math.min(...form.weightOptions.map(w => Number(w.price)))
      : form.price;
    formData.append("price",        basePrice);
    formData.append("category",     form.category);
    formData.append("stock",        form.stock);
    formData.append("isAvailable",  form.isAvailable);
    if (form.category === "Tea")
      formData.append("weightOptions", JSON.stringify(form.weightOptions));
    const keptInOrder = form.allPreviews.filter(p => p.type === "existing").map(p => p.serverPath);
    formData.append("keptImages", JSON.stringify(keptInOrder));
    const newPreviewsInOrder = form.allPreviews.filter(p => p.type === "new");
    newPreviewsInOrder.forEach(p => formData.append("images", form.imageFiles[p.fileIndex]));

    const url    = editProduct
      ? `http://localhost:5000/api/admin/products/${editProduct._id}`
      : "http://localhost:5000/api/admin/products";
    const method = editProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (res.ok) {
        setMessage(editProduct ? "Product updated!" : "Product added!");
        setShowForm(false); setEditProduct(null); setForm(emptyForm);
        fetchProducts();
      } else {
        const data = await res.json();
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    const existingPreviews = (product.images || []).map(serverPath => ({
      type: "existing", src: `http://localhost:5000${serverPath}`, serverPath,
    }));
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      category:    product.category,
      stock:       product.stock,
      isAvailable: product.isAvailable,
      weightOptions: (product.weightOptions || []).map(w =>
        typeof w === "object" ? w : { weight: w, price: product.price }
      ),
      existingImages: product.images || [],
      imageFiles:     [],
      allPreviews:    existingPreviews,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setMessage("Product deleted."); setDeleteConfirm(null); fetchProducts(); }
    } catch {
      setMessage("Failed to delete.");
    }
  };

  const TABS = [
    { key: "products",  label: "🕯️ Products" },
    { key: "orders",    label: "📦 Orders" },
    { key: "feedback",  label: "⭐ Feedback" },
    { key: "users",     label: "👥 Users" },
  ];

  return (
    <div className="adm-wrap">

      {newOrderAlert && <NewOrderToast onDismiss={dismissAlert} />}

      {/* ── SIDEBAR ── */}
      <div className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-flame" />
          <div className="adm-candle" />
          <h1>Shree Chemicals</h1>
          <p>Admin Portal</p>
        </div>
        <nav className="adm-nav">
          {TABS.map(({ key, label }) => (
            <div
              key={key}
              className={`adm-nav-item ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span>{label}</span>
              {key === "orders" && pendingCount > 0 && (
                <span className="adm-nav-badge">{pendingCount}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <div className="adm-admin-info">
            <div className="adm-avatar">{admin.name?.charAt(0) || "A"}</div>
            <div>
              <div className="adm-admin-name">{admin.name || "Admin"}</div>
              <div className="adm-admin-email">{admin.email || ""}</div>
            </div>
          </div>
          <button className="adm-logout" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="adm-main">
        <div className="adm-topbar">
          <div>
            <h2>
              {activeTab === "products" && "Product Management"}
              {activeTab === "orders" && (
                <span>
                  Orders
                  {pendingCount > 0 && (
                    <span className="adm-topbar-badge">{pendingCount} pending</span>
                  )}
                </span>
              )}
              {activeTab === "feedback" && "Customer Reviews"}
              {activeTab === "users"    && "User Management"}
            </h2>
            <p>{products.length} products in store</p>
          </div>
          {activeTab === "products" && (
            <button
              className="adm-btn-add"
              onClick={() => { setShowForm(!showForm); setEditProduct(null); setForm(emptyForm); }}
            >
              {showForm ? "✕ Cancel" : "+ Add Product"}
            </button>
          )}
        </div>

        {message && (
          <div className="adm-message" onClick={() => setMessage("")}>{message} ✕</div>
        )}

        {/* ── Product form ── */}
        {showForm && activeTab === "products" && (
          <div className="adm-form-card">
            <h3>{editProduct ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit} className="adm-form">
              <div className="adm-form-row">
                <div className="adm-form-field">
                  <label>Product Name</label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Green Tea" required />
                </div>
                <div className="adm-form-field">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleFormChange} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryIcon[c]} {c}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-form-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange}
                  placeholder="Describe the product…" rows={3} required />
              </div>
              {form.category !== "Tea" && (
                <div className="adm-form-row">
                  <div className="adm-form-field">
                    <label>Price (₹)</label>
                    <input name="price" type="number" value={form.price} onChange={handleFormChange}
                      placeholder="299" required={form.category !== "Tea"} />
                  </div>
                  <div className="adm-form-field">
                    <label>Stock</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleFormChange} placeholder="50" required />
                  </div>
                </div>
              )}
              {form.category === "Tea" && (
                <div className="adm-form-field">
                  <label>Stock</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleFormChange} placeholder="50" required />
                </div>
              )}
              {form.category === "Tea" && (
                <div className="adm-form-field">
                  <label>Weight Options &amp; Prices</label>
                  <div className="adm-weight-price-list">
                    {WEIGHT_OPTS.map(w => {
                      const entry     = form.weightOptions.find(x => x.weight === w);
                      const isChecked = !!entry;
                      return (
                        <div key={w} className="adm-weight-price-row">
                          <input type="checkbox" id={`w-${w}`} checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setForm(prev => ({ ...prev, weightOptions: prev.weightOptions.filter(x => x.weight !== w) }));
                              } else {
                                setForm(prev => ({ ...prev, weightOptions: [...prev.weightOptions, { weight: w, price: "" }] }));
                              }
                            }} />
                          <label htmlFor={`w-${w}`} className="adm-weight-chip-label">{w}</label>
                          {isChecked && (
                            <input type="number" className="adm-weight-price-input"
                              placeholder="₹ Price" value={entry.price} min="0"
                              onChange={e => setForm(prev => ({
                                ...prev,
                                weightOptions: prev.weightOptions.map(x =>
                                  x.weight === w ? { ...x, price: e.target.value } : x
                                ),
                              }))} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="adm-weight-hint">✓ Check a weight and set its price</p>
                </div>
              )}
              <div className="adm-form-field">
                <label>
                  Product Images ({form.allPreviews.length}/5)
                  {form.allPreviews.length > 0 && (
                    <span className="adm-img-hint"> — drag arrows to reorder, ✕ to remove</span>
                  )}
                </label>
                {form.allPreviews.length > 0 && (
                  <div className="adm-img-preview-row">
                    {form.allPreviews.map((item, idx) => (
                      <div key={idx} className="adm-img-preview-wrap">
                        <img src={item.src} alt="" className="adm-img-preview" />
                        {idx === 0 && <span className="adm-img-badge">Cover</span>}
                        <button type="button" className="adm-img-remove" onClick={() => handleImageRemove(idx)}>✕</button>
                        <div className="adm-img-order-btns">
                          <button type="button" disabled={idx === 0} onClick={() => handleImageMove(idx, -1)}>◀</button>
                          <button type="button" disabled={idx === form.allPreviews.length - 1} onClick={() => handleImageMove(idx, 1)}>▶</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {form.allPreviews.length < 5 && (
                  <div className="adm-upload-area" onClick={() => document.getElementById("img-upload").click()}>
                    <input id="img-upload" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageAdd} />
                    <div className="adm-upload-placeholder">
                      📷 Click to add images ({5 - form.allPreviews.length} remaining)
                    </div>
                  </div>
                )}
              </div>
              <div className="adm-form-check">
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleFormChange} id="avail" />
                <label htmlFor="avail">Available for sale</label>
              </div>
              <div className="adm-form-actions">
                <button type="submit" className="adm-btn-save">
                  {editProduct ? "Update Product" : "Add Product"} →
                </button>
                <button type="button" className="adm-btn-cancel"
                  onClick={() => { setShowForm(false); setEditProduct(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab content ── */}
        {activeTab === "products" && (
          <div className="adm-table-card">
            {loading ? (
              <div className="adm-loading">Loading products…</div>
            ) : products.length === 0 ? (
              <div className="adm-empty">
                <p>No products yet.</p>
                <p>Click "+ Add Product" to get started!</p>
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Image</th><th>Name</th><th>Category</th>
                    <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        {p.images?.length > 0
                          ? <img src={`http://localhost:5000${p.images[0]}`} alt={p.name} className="adm-product-img" />
                          : <div className="adm-no-img">{categoryIcon[p.category] || "📦"}</div>}
                      </td>
                      <td>
                        <div className="adm-product-name">{p.name}</div>
                        <div className="adm-product-desc">{p.description?.slice(0, 50)}…</div>
                        {p.weightOptions?.length > 0 && (
                          <div className="adm-weight-tags">
                            {p.weightOptions.map(w => (
                              <span key={typeof w === "object" ? w.weight : w} className="adm-weight-tag">
                                {typeof w === "object" ? `${w.weight} · ₹${w.price}` : w}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td><span className="adm-badge">{categoryIcon[p.category]} {p.category}</span></td>
                      <td className="adm-price">₹{p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={`adm-status ${p.isAvailable ? "available" : "unavailable"}`}>
                          {p.isAvailable ? "Available" : "Hidden"}
                        </span>
                      </td>
                      <td>
                        <div className="adm-actions">
                          <button className="adm-btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                          <button className="adm-btn-delete" onClick={() => setDeleteConfirm(p._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "orders"   && <OrdersTab   token={token} />}
        {activeTab === "feedback" && <FeedbackTab token={token} />}
        {activeTab === "users"    && <UsersTab    token={token} />}
      </div>

      {/* ── Delete product modal ── */}
      {deleteConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="adm-modal-actions">
              <button className="adm-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
              <button className="adm-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;