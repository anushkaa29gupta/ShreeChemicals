import { useState, useRef, useEffect } from "react"; // add useEffect
import "./collections.css";


const CATEGORIES = ["All", "Candles", "Incense", "Teas", "Gift Sets"];

const PRODUCTS = [
  {
    id: 1, category: "Candles", name: "Sandalwood Pillar",
    desc: "Pure beeswax with aged sandalwood oil. Burns 60+ hours.",
    price: "₹480", badge: "Best Seller", emoji: "🕯️",
    bg: "linear-gradient(135deg,#dceef8 0%,#a8d4ed 100%)",
  },
  {
    id: 2, category: "Incense", name: "Rose Agarbatti",
    desc: "Hand-rolled on bamboo. 100% natural rose & attar blend.",
    price: "₹120", badge: null, emoji: "🌹",
    bg: "linear-gradient(135deg,#e8f0f8 0%,#b8cce0 100%)",
  },
  {
    id: 3, category: "Teas", name: "Ashwagandha Chai",
    desc: "Classic Assam CTC with adaptogenic ashwagandha root.",
    price: "₹220", badge: "New", emoji: "🍵",
    bg: "linear-gradient(135deg,#e0edf8 0%,#9ec4e0 100%)",
  },
  {
    id: 4, category: "Gift Sets", name: "Puja Essentials Set",
    desc: "Curated box: candles, agarbatti & sacred dhoop cones.",
    price: "₹950", badge: "Gift", emoji: "🎁",
    bg: "linear-gradient(135deg,#eaf4fb 0%,#b0d4ec 100%)",
  },
  {
    id: 5, category: "Candles", name: "Jasmine Wax Votives",
    desc: "Set of 4 jasmine-infused votives in terracotta cups.",
    price: "₹340", badge: null, emoji: "🌸",
    bg: "linear-gradient(135deg,#f0f6fc 0%,#c4ddf0 100%)",
  },
  {
    id: 6, category: "Incense", name: "Loban Dhoop Sticks",
    desc: "Traditional benzoin resin dhoop. Temple-grade purity.",
    price: "₹180", badge: "Popular", emoji: "💨",
    bg: "linear-gradient(135deg,#e4eef8 0%,#a4c8e4 100%)",
  },
];

const CAT_CARDS = [
  { name: "Candles",   emoji: "🕯️", count: "12 products",   bg: "linear-gradient(145deg,#1a3550,#2d6e96)" },
  { name: "Incense",   emoji: "🌿", count: "18 products",   bg: "linear-gradient(145deg,#1a3044,#2d5a7a)" },
  { name: "Teas",      emoji: "🍵", count: "8 products",    bg: "linear-gradient(145deg,#1a2a40,#2d4d70)" },
  { name: "Gift Sets", emoji: "🎁", count: "6 collections", bg: "linear-gradient(145deg,#1a3550,#3a6080)" },
];

const TRUST = [
  { icon: "⏳", label: "Est. 1960" },
  { icon: "🌿", label: "Pure Ingredients" },
  { icon: "🤲", label: "Handcrafted" },
  { icon: "🚚", label: "Pan-India Shipping" },
];

export default function Collections() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [added, setAdded]               = useState({});
  const [muted, setMuted]               = useState(true);   // video starts muted; user can unmute
  const videoRef = useRef(null);

  // Add this after your state declarations
useEffect(() => {
  if (videoRef.current) {
    videoRef.current.muted = true;
    videoRef.current.play().catch((err) => {
      console.warn("Autoplay blocked:", err);
    //   setVideoError(true);
    });
  }
}, []);

  const filtered = PRODUCTS.filter(
    (p) => activeFilter === "All" || p.category === activeFilter
  );

  const handleAdd = (id) => {
    setAdded((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [id]: false })), 1800);
  };

  const scrollToProducts = () => {
    document.getElementById("coll-products")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="coll-page">

      {/* ── HERO ── */}
      <section className="coll-hero">
        {/*
          ✅  Drop your video file in /public/videos/ and update the src below.
              autoPlay + loop are on. Sound starts MUTED (browser policy).
              Users can unmute via the button bottom-right of the hero.
        */}
        <video
          ref={videoRef}
          className="coll-hero__video"
          src="/videos/collections-hero.mp4"
          autoPlay
          muted          /* always start muted — required by browsers for autoplay */
          loop
          playsInline
          preload="auto"
        >
        </video>

        {/* Fallback background if video can't load */}
        <div className="coll-hero__fallback" />

        {/* Dark-blue overlay for text readability */}
        <div className="coll-hero__overlay" />

        <div className="coll-hero__content">
          <span className="coll-hero__eyebrow">Shree Chemicals — Since 1960</span>
          <h1 className="coll-hero__title">
            Our <em>Collections</em>
          </h1>
          <p className="coll-hero__sub">
            Pure ingredients. Timeless rituals.<br />
            Crafted with devotion, delivered with care.
          </p>
          <button className="coll-hero__cta" onClick={scrollToProducts}>
            Shop Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>

        {/* Sound toggle — bottom-right */}
        <button
          className="coll-hero__sound-btn"
          onClick={toggleMute}
          title={muted ? "Unmute video" : "Mute video"}
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? (
            /* muted icon */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18">
              <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round"/>
              <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round"/>
            </svg>
          ) : (
            /* unmuted icon */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18">
              <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span>{muted ? "Sound Off" : "Sound On"}</span>
        </button>

        {/* Scroll hint */}
        <div className="coll-hero__scroll" onClick={scrollToProducts} style={{ cursor: "pointer" }}>
          <span>Scroll</span>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M12 5v14M5 15l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          </svg>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        {TRUST.map((t) => (
          <div key={t.label} className="trust-strip__item">
            <span>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${activeFilter === cat ? " active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="coll-main">

        {/* Category Cards */}
        <div className="section-header">
          <div className="section-header__left">
            <div className="section-header__eyebrow">Browse by Category</div>
            <h2 className="section-header__title">Shop the Range</h2>
          </div>
        </div>

        <div className="cat-grid">
          {CAT_CARDS.map((c) => (
            <div
              key={c.name}
              className="cat-card"
              onClick={() => setActiveFilter(c.name)}
            >
              <div className="cat-card__bg" style={{ background: c.bg }} />
              <div className="cat-card__overlay" />
              <div className="cat-card__body">
                <span className="cat-card__emoji">{c.emoji}</span>
                <span className="cat-card__name">{c.name}</span>
                <span className="cat-card__count">{c.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Products */}
        <div id="coll-products">
          <div className="section-header">
            <div className="section-header__left">
              <div className="section-header__eyebrow">
                {activeFilter === "All" ? "All Products" : activeFilter}
              </div>
              <h2 className="section-header__title">
                {activeFilter === "All" ? "Everything We Make" : `Our ${activeFilter}`}
              </h2>
            </div>
            <span className="section-header__count">{filtered.length} items</span>
          </div>

          <div className="product-grid">
            {filtered.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-card__img" style={{ background: p.bg }}>
                  <span className="product-card__img-placeholder">{p.emoji}</span>
                  {p.badge && <span className="product-card__badge">{p.badge}</span>}
                </div>
                <div className="product-card__body">
                  <div className="product-card__cat">{p.category}</div>
                  <div className="product-card__name">{p.name}</div>
                  <div className="product-card__desc">{p.desc}</div>
                  <div className="product-card__footer">
                    <div className="product-card__price">{p.price}</div>
                    <button
                      className={`add-btn${added[p.id] ? " added" : ""}`}
                      onClick={() => handleAdd(p.id)}
                    >
                      {added[p.id] ? "✓ Added" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Festival Banner */}
        <div className="festival-banner">
          <div>
            <div className="festival-banner__eyebrow">Limited Edition</div>
            <div className="festival-banner__title">Diwali Festival Collection</div>
            <div className="festival-banner__sub">
              Special gift hampers, handcrafted diyas, and festive agarbatti sets — available for a limited time.
            </div>
          </div>
          <button className="festival-banner__btn">Explore Festive Sets</button>
        </div>

      </main>
    </div>
  );
}