import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "./About.css";

/* ── safe logo import ── */
let logo = null;
try {
  const m = import.meta.glob("../assets/logo.png", { eager: true, query: "?url" });
  const k = Object.keys(m)[0];
  if (k) logo = m[k].default ?? m[k];
} catch {
  /* logo missing — emoji fallback used */
}

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 5–7 business days across India. For Agra and nearby regions, we often deliver within 2–3 days. Expedited shipping is available at checkout.",
  },
  {
    q: "Will I be notified about my order?",
    a: "Yes! You'll receive real-time updates via WhatsApp — from order confirmation to dispatch and delivery. Make sure your WhatsApp number is entered correctly during checkout.",
  },
  {
    q: "What if I have a quality issue with my product?",
    a: "We stand behind every product we make. If you receive a damaged or defective item, contact us within 48 hours of delivery with photos. We'll arrange a replacement or full refund — no questions asked.",
  },
  {
    q: "What is your refund and return policy?",
    a: "Unused products in original packaging can be returned within 7 days. Refunds are processed within 5–7 business days to your original payment method. Customised or sale items are non-refundable.",
  },
  {
    q: "Do you provide GST invoices?",
    a: "Absolutely. A proper GST-compliant tax invoice is generated for every order and sent to your registered email. You can also download it from your order history in your account.",
  },
  {
    q: "Are your products safe and certified?",
    a: "All our candles, teas, and incense sticks are made using food-grade and cosmetic-grade raw materials. Our facility follows strict quality checks and hygiene standards since 1960.",
  },
];

const stats = [
  { value: "60+",  label: "Years of Legacy"  },
  { value: "10K+", label: "Happy Customers"  },
  { value: "50+",  label: "Product Variants" },
  { value: "4.8★", label: "Google Rating"    },
];

const products = [
  { emoji: "🕯️", name: "Candles",        desc: "Hand-poured scented & decorative candles for every occasion" },
  { emoji: "🍵", name: "Premium Teas",   desc: "Artisan blends sourced from the finest estates across India"  },
  { emoji: "🌿", name: "Incense Sticks", desc: "Pure aromatic agarbatti crafted to calm your senses"          },
];

export default function AboutUs() {
  const [openFaq, setOpenFaq] = useState(null);
  const [visible, setVisible] = useState({});

  /* Store DOM nodes without touching them during render */
  const nodeMap    = useRef({});
  const observerRf = useRef(null);

  useEffect(() => {
    observerRf.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-rid");
            if (id) setVisible((prev) => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.12 }
    );

    /* Observe any nodes already registered */
    Object.values(nodeMap.current).forEach((el) => {
      if (el) observerRf.current.observe(el);
    });

    return () => observerRf.current.disconnect();
  }, []);

  /*
   * Returns a callback ref.
   * React calls callback refs AFTER the render cycle — safe to read/write refs here.
   */
  const setRef = (id) => (el) => {
    if (!el || nodeMap.current[id] === el) return;
    nodeMap.current[id] = el;
    el.setAttribute("data-rid", id);
    /* If observer already running, observe this new node immediately */
    if (observerRf.current) observerRf.current.observe(el);
  };

  /* Spread this onto any div you want animated */
  const anim = (id, delay = 0) => ({
    ref: setRef(id),
    style: {
      opacity:    visible[id] ? 1 : 0,
      transform:  visible[id] ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    },
  });

  return (
    <div className="about-root">

      {/* ── STICKY NAVBAR ── */}
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="ab-hero">
        <div className="ab-orb ab-orb1" />
        <div className="ab-orb ab-orb2" />

        <div className="ab-hero-inner">
          <div className="ab-logo-circle">
            {logo
              ? <img src={logo} alt="Shree Chemicals" />
              : <span className="ab-logo-fallback">🕯️</span>}
          </div>

          <div className="ab-pill">Est. 1960 &nbsp;·&nbsp; Agra, India</div>

          <h1 className="ab-hero-h1">
            About <em>Shree</em><br />Chemicals
          </h1>

          <p className="ab-hero-sub">
            Scenting spaces, creating memories — since always.<br />
            A legacy of purity, craftsmanship and warmth<br />from the heart of Agra.
          </p>

          <div className="ab-hero-btns">
            <a
              href="https://google.com/maps?daddr=31/54,+Rawatpara,+Kasmiri+Road,+Mantola,+Agra,+Uttar+Pradesh+282003"
              target="_blank"
              rel="noopener noreferrer"
              className="ab-btn-primary"
            >
              📍 Get Directions
            </a>
            <a href="#faq" className="ab-btn-outline">Read FAQs</a>
          </div>
        </div>
      </section>

      {/* ══ STATS BELT ══ */}
      <div className="ab-stats-belt">
        {stats.map((s) => (
          <div className="ab-stat-cell" key={s.label}>
            <div className="ab-stat-val">{s.value}</div>
            <div className="ab-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ OUR STORY ══ */}
      <section className="ab-section ab-story-bg">
        <div className="ab-inner">
          <div className="ab-story-grid">

            <div {...anim("story-card")}>
              <div className="ab-card3d">
                <div className="ab-card-year">1960</div>
                <div className="ab-card-badge">Our Founding Year</div>
                <h3>A Legacy Born in Agra</h3>
                <p>
                  What began as a small candle-making unit in Rawatpara has grown
                  into one of Agra's most trusted names in scented products —
                  carrying the essence of tradition into modern homes.
                </p>
              </div>
            </div>

            <div {...anim("story-text", 0.15)}>
              <span className="ab-tag">Our Story</span>
              <h2 className="ab-section-title">
                Rooted in Tradition,<br /><em>Crafted with Care</em>
              </h2>
              <div className="ab-divider" />
              <p className="ab-body">
                Shree Chemicals was established in 1960 in the Rawatpara area of Agra,
                Uttar Pradesh — just steps away from the revered Mankameshwar Temple.
                Over six decades, we have dedicated ourselves to crafting products that
                bring warmth, fragrance, and serenity into homes across India.
              </p>
              <br />
              <p className="ab-body">
                From our signature scented candles to premium tea blends and aromatic
                incense sticks, every product is made with the same passion that our
                founders instilled from day one. Customer centricity is not just a
                value — it is the heartbeat of everything we do.
              </p>
              <br />
              <p className="ab-body">
                We are proud to be <strong>JD Verified</strong> and{" "}
                <strong>Claimed</strong> with a rating of <strong>4.5 ★</strong> on
                JustDial, and <strong>4.8 ★</strong> on Google — a testimony to the
                trust our customers place in us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRODUCTS ══ */}
      <section className="ab-section ab-products-bg">
        <div className="ab-inner">
          <div className="ab-center" {...anim("prod-head")}>
            <span className="ab-tag">What We Offer</span>
            <h2 className="ab-section-title">Our <em>Product Range</em></h2>
            <div className="ab-divider ab-divider-center" />
          </div>
          <div className="ab-products-grid">
            {products.map((p, i) => (
              <div
                className="ab-product-card"
                key={p.name}
                {...anim(`prod-${i}`, i * 0.12)}
              >
                <span className="ab-product-emoji">{p.emoji}</span>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ADDRESS + MAP ══ */}
      <section className="ab-section ab-address-bg">
        <div className="ab-inner">
          <div className="ab-address-grid">

            <div {...anim("addr-info")}>
              <div className="ab-address-card">
                <span className="ab-tag ab-tag-light">Find Us</span>
                <h2 className="ab-section-title ab-title-light">
                  Visit Our<br /><em className="ab-em-light">Store</em>
                </h2>
                <div className="ab-divider" />

                {[
                  { icon: "📍", label: "Address",
                    val: "31/54, Near Mankameshwar Temple,\nRawatpara, Agra – 282003,\nUttar Pradesh, India" },
                  { icon: "🕗", label: "Store Hours",     val: "Open Daily · Closes 8:00 PM"         },
                  { icon: "🚗", label: "Nearby Landmark", val: "Mankameshwar Temple, Rawatpara"       },
                  { icon: "💳", label: "Payment Modes",   val: "Cash · Cheque · Demand Draft · UPI"  },
                  { icon: "🚚", label: "Delivery",        val: "Same-day delivery available locally" },
                ].map((row) => (
                  <div className="ab-detail-row" key={row.label}>
                    <span className="ab-detail-icon">{row.icon}</span>
                    <div>
                      <div className="ab-detail-label">{row.label}</div>
                      <div
                        className="ab-detail-val"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {row.val}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="ab-map-btn-row">
                  <a
                    href="https://google.com/maps?daddr=31/54,+Rawatpara,+Kasmiri+Road,+Mantola,+Agra,+Uttar+Pradesh+282003"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ab-map-btn ab-map-btn-primary"
                  >
                    🗺️ Open in Google Maps
                  </a>
                  <a
                    href="https://api.whatsapp.com/send?phone=919897405123&text=Hi%20Shree%20Chemicals!%20I%20need%20some%20help."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ab-map-btn ab-map-btn-secondary"
                  >
                    💬 WhatsApp Us
                  </a>
                </div>
              </div>
            </div>

            <div {...anim("addr-map", 0.15)}>
              <div className="ab-map-frame">
                <iframe
                  title="Shree Chemicals Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.5!2d78.0081!3d27.1767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDEwJzM2LjEiTiA3OMKwMDAnMjkuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="360"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
              <div className="ab-map-info">
                📞 <strong>+91 98974 05123</strong> &nbsp;|&nbsp; +91 80478 8047
                <br />
                🌐 Visit us on{" "}
                <a
                  href="https://www.indiamart.com/shree-chemicals-agra"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IndiaMART
                </a>{" "}
                or{" "}
                <a
                  href="https://www.justdial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  JustDial
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQs ══ */}
      <section className="ab-section ab-faq-bg" id="faq">
        <div className="ab-inner">
          <div className="ab-center" {...anim("faq-head")}>
            <span className="ab-tag">Customer Help</span>
            <h2 className="ab-section-title">
              Frequently Asked <em>Questions</em>
            </h2>
            <div className="ab-divider ab-divider-center" />
            <p className="ab-body ab-faq-sub">
              Everything you need to know before you shop with us.
            </p>
          </div>

          <div className="ab-faq-wrap" {...anim("faq-list", 0.1)}>
            {faqs.map((f, i) => (
              <div
                className={`ab-faq-item${openFaq === i ? " open" : ""}`}
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="ab-faq-q">
                  <span>{f.q}</span>
                  <div className="ab-faq-chevron">▾</div>
                </div>
                <div className="ab-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER STRIP ══ */}
      <div className="ab-footer-strip">
        <p>
          <strong>Shree Chemicals</strong> · 31/54, Rawatpara, Agra – 282003, UP ·{" "}
          <a href="mailto:shreechem@example.com">01shreechemicals@gmail.com</a> ·{" "}
          <strong>Est. 1960</strong>
        </p>
        <p className="ab-footer-tagline">
          Scenting Spaces · Creating Memories · Since Always
        </p>
      </div>

    </div>
  );
}