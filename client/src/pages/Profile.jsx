import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Profile.css";

const API = "http://localhost:5000/api";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem("token");

  // Derive active tab from location.state; fall back to "orders"
  const [activeTab, setActiveTab] = useState(location.state?.tab || "orders");

  // Sync tab if the user navigates here again via the Navbar without unmounting
  const prevLocationTab = useRef(location.state?.tab);
  useEffect(() => {
    const incoming = location.state?.tab;
    if (incoming && incoming !== prevLocationTab.current) {
      prevLocationTab.current = incoming;
      setActiveTab(incoming);
    }
  }, [location.state?.tab]);

  const [orders,         setOrders]         = useState([]);
  const [loadingOrders,  setLoadingOrders]  = useState(true);
  const [profile,        setProfile]        = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing,        setEditing]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [saveMsg,        setSaveMsg]        = useState("");
  const [form,           setForm]           = useState({});

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
    setLoadingOrders(false);
  };

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setForm({
        firstName:      data.firstName      || "",
        lastName:       data.lastName       || "",
        phone:          data.phone          || "",
        whatsapp:       data.whatsapp       || "",
        alternatePhone: data.alternatePhone || "",
        homeAddress:    data.homeAddress    || "",
        workAddress:    data.workAddress    || "",
        landmark:       data.landmark       || "",
        city:           data.city           || "",
        pincode:        data.pincode        || "",
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    }
    setLoadingProfile(false);
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const init = async () => {
      await fetchOrders();
      await fetchProfile();
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save profile ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res  = await fetch(`${API}/auth/profile`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSaveMsg("✅ Profile updated!");
        setEditing(false);
      } else {
        setSaveMsg("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      setSaveMsg("❌ Server error.");
    }
    setSaving(false);
  };

  // ── Status config ──────────────────────────────────────────────────────────
  // step: which dot index is "active" (0-based).
  // done = step > i  →  all dots before the active one show ✓
  // Steps: 0 = Order Placed, 1 = Payment Pending, 2 = Confirmed & Shipping, 3 = Delivered
  const statusConfig = {
    pending:   { label: "Payment Pending",       color: "#f39c12", bg: "#fff8e1", step: 1 },
    approved:  { label: "Confirmed & Shipping",  color: "#27ae60", bg: "#eafaf1", step: 2 },
    declined:  { label: "Declined",              color: "#e74c3c", bg: "#fdf0ef", step: -1 },
    delivered: { label: "Delivered",             color: "#8e44ad", bg: "#f5eef8", step: 3 },
  };

  const timelineSteps = ["Order Placed", "Payment Confirmed", "Confirmed & Shipping", "Delivered"];

  const initials = profile
    ? `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`
    : "??";

  return (
    <div className="profile-root">
      <Navbar cartCount={0} />

      {/* ── HERO STRIP ── */}
      <div className="profile-hero">
        <div className="profile-hero-blob blob1" />
        <div className="profile-hero-blob blob2" />
        <div className="profile-hero-blob blob3" />
        <div className="profile-hero-inner">
          <div className="profile-avatar-xl">{initials}</div>
          <div className="profile-hero-info">
            <h1>{profile ? `${profile.firstName} ${profile.lastName}` : "Loading…"}</h1>
            <p>{profile?.email}</p>
            <p className="profile-hero-city">
              {profile?.city ? `📍 ${profile.city.toUpperCase()}` : ""}
              {profile?.city && profile?.pincode ? `, ${profile.pincode}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="profile-tabs-wrap">
        <div className="profile-tabs">
          <button
            className={`ptab ${activeTab === "orders" ? "ptab-active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 My Orders
            {orders.length > 0 && <span className="ptab-badge">{orders.length}</span>}
          </button>
          <button
            className={`ptab ${activeTab === "profile" ? "ptab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Details
          </button>
        </div>
      </div>

      <div className="profile-body">

        {/* ════ ORDERS TAB ════ */}
        {activeTab === "orders" && (
          <div className="orders-tab">
            {loadingOrders ? (
              <div className="profile-loading">
                <div className="loader-dots"><span /><span /><span /></div>
                <p>Loading your orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="profile-empty">
                <div className="empty-icon">🛍️</div>
                <h3>No orders yet</h3>
                <p>When you place an order, it'll show up here.</p>
                <button onClick={() => navigate("/shop")}>Browse the Store →</button>
              </div>
            ) : (
              orders.map((order) => {
                const s = statusConfig[order.status] || statusConfig.pending;
                return (
                  <div className="order-card" key={order._id}>
                    {/* Header */}
                    <div className="order-card-header" style={{ borderLeftColor: s.color }}>
                      <div className="order-card-meta">
                        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="order-status-pill" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>

                    {/* Timeline (hidden for declined) */}
                    {order.status !== "declined" ? (
                      <div className="order-timeline">
                        {timelineSteps.map((stepLabel, i) => {
                          // s.step is the ACTIVE step index (0-based).
                          // For "delivered" step === 3, so all 4 dots are done/active.
                          const done   = s.step > i;          // already passed → green ✓
                          const active = s.step === i;        // current step → pulse
                          return (
                            <div key={i} className={`tl-step ${done ? "tl-done" : ""} ${active ? "tl-active" : ""}`}>
                              <div className="tl-dot">
                                {done ? "✓" : active ? <span className="tl-pulse" /> : ""}
                              </div>
                              {i < timelineSteps.length - 1 && (
                                <div className={`tl-line ${done ? "tl-line-done" : ""}`} />
                              )}
                              <span className="tl-label">{stepLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="order-declined-bar">
                        <span>❌ Order was not confirmed.</span>
                        <span>Reach out to us on WhatsApp to resolve this.</span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="order-items-list">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item-row">
                          <span className="oi-name">
                            {item.name}{item.weight ? ` · ${item.weight}` : ""}
                          </span>
                          <span className="oi-qty">×{item.quantity}</span>
                          <span className="oi-price">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="order-card-footer">
                      <span className="order-total">
                        Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                      {order.status === "approved" && order.deliveryDate && (
                        <span className="order-delivery">🚚 Est. Delivery: {order.deliveryDate}</span>
                      )}
                      {order.status === "pending" && (
                        <span className="order-pending-note">⏳ Awaiting payment confirmation on WhatsApp</span>
                      )}
                      {order.status === "delivered" && (
                        <span className="order-delivered-note">✅ Delivered — check your email for the feedback link!</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ════ PROFILE / MY DETAILS TAB ════ */}
        {activeTab === "profile" && (
          <div className="profile-tab">
            {loadingProfile ? (
              <div className="profile-loading">
                <div className="loader-dots"><span /><span /><span /></div>
              </div>
            ) : (
              <>
                {saveMsg && (
                  <div className={`save-banner ${saveMsg.startsWith("✅") ? "save-ok" : "save-err"}`}>
                    {saveMsg}
                  </div>
                )}

                <div className="profile-form-grid">
                  {/* Personal Info */}
                  <div className="pf-section">
                    <h3 className="pf-section-title">
                      <span className="pf-section-icon">👤</span> Personal Info
                    </h3>
                    <div className="pf-row">
                      <div className="pf-field">
                        <label>First Name</label>
                        {editing
                          ? <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                          : <div className="pf-value">{profile?.firstName || "—"}</div>}
                      </div>
                      <div className="pf-field">
                        <label>Last Name</label>
                        {editing
                          ? <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                          : <div className="pf-value">{profile?.lastName || "—"}</div>}
                      </div>
                    </div>
                    <div className="pf-field pf-field-full">
                      <label>Email (cannot change)</label>
                      <div className="pf-value pf-locked">{profile?.email} 🔒</div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="pf-section">
                    <h3 className="pf-section-title">
                      <span className="pf-section-icon">📞</span> Contact
                    </h3>
                    <div className="pf-row">
                      <div className="pf-field">
                        <label>Phone</label>
                        {editing
                          ? <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                          : <div className="pf-value">{profile?.phone || "—"}</div>}
                      </div>
                      <div className="pf-field">
                        <label>WhatsApp</label>
                        {editing
                          ? <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
                          : <div className="pf-value">{profile?.whatsapp || "—"}</div>}
                      </div>
                    </div>
                    <div className="pf-field pf-field-full">
                      <label>Alternate Phone</label>
                      {editing
                        ? <input value={form.alternatePhone} onChange={e => setForm({ ...form, alternatePhone: e.target.value })} />
                        : <div className="pf-value">{profile?.alternatePhone || "—"}</div>}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="pf-section pf-section-full">
                    <h3 className="pf-section-title">
                      <span className="pf-section-icon">🏠</span> Address
                    </h3>
                    <div className="pf-field pf-field-full">
                      <label>Home Address</label>
                      {editing
                        ? <textarea value={form.homeAddress} rows={2} onChange={e => setForm({ ...form, homeAddress: e.target.value })} />
                        : <div className="pf-value">{profile?.homeAddress || "—"}</div>}
                    </div>
                    <div className="pf-field pf-field-full">
                      <label>Work Address</label>
                      {editing
                        ? <textarea value={form.workAddress} rows={2} onChange={e => setForm({ ...form, workAddress: e.target.value })} />
                        : <div className="pf-value">{profile?.workAddress || "—"}</div>}
                    </div>
                    <div className="pf-row">
                      <div className="pf-field">
                        <label>Landmark</label>
                        {editing
                          ? <input value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} />
                          : <div className="pf-value">{profile?.landmark || "—"}</div>}
                      </div>
                      <div className="pf-field">
                        <label>City</label>
                        {editing
                          ? <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                          : <div className="pf-value">{profile?.city || "—"}</div>}
                      </div>
                      <div className="pf-field">
                        <label>Pincode</label>
                        {editing
                          ? <input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                          : <div className="pf-value">{profile?.pincode || "—"}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pf-actions">
                  {editing ? (
                    <>
                      <button className="pf-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "💾 Save Changes"}
                      </button>
                      <button className="pf-btn-cancel" onClick={() => { setEditing(false); setSaveMsg(""); }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="pf-btn-edit" onClick={() => setEditing(true)}>
                      ✏️ Edit Details
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;