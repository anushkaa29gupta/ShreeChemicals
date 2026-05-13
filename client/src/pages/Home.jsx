import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import LoginPopup from "../components/LoginPopup";
import "./Home.css";

import one   from "../assets/chemicals/one.jpeg";
import two   from "../assets/chemicals/two.jpeg";
import three from "../assets/chemicals/three.jpeg";
import four  from "../assets/chemicals/four.jpeg";
import five  from "../assets/chemicals/five.jpeg";
import six   from "../assets/chemicals/six.jpeg";
import seven from "../assets/chemicals/NINE.jpg";
import heroImg from "../assets/chemicals/heroImg.png";

const staticImages  = [one, two, three, four, five, six, seven];
const staticPrices  = [
  299, 349, 399, 449, 499, 549, 599, 649, 699, 749,
  799, 849, 899, 949, 999, 1049, 1099, 1149, 1199, 1249,
];

const STATIC_PRODUCTS = [...Array(20)].map((_, i) => ({
  _id: `static-${i}`,
  name: `Best Seller ${i + 1}`,
  price: staticPrices[i],
  images: [staticImages[i % staticImages.length]],
  description: "Handcrafted signature candle with premium fragrance.",
  category: "Candles",
  stock: 10,
  isAvailable: true,
  isStatic: true,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}));

const features = [
  {
    icon: "🏆",
    title: "Premium Quality",
    desc:  "Every product is made from the finest raw materials, rigorously tested to meet industry standards.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    desc:  "Pan-India logistics network ensuring your order reaches you within 5–7 business days.",
  },
  {
    icon: "🌸",
    title: "Rich Fragrances",
    desc:  "From calming florals to energising citrus — scents crafted to transform every space.",
  },
];

const stats = [
  { value: "60+",  label: "Years of Legacy"  },
  { value: "10K+", label: "Happy Customers"  },
  { value: "50+",  label: "Product Variants" },
  { value: "4.8★", label: "Google Rating"    },
];

/* ─────────────────────────────────────────── */

const Home = () => {
  const [cartCount,        setCartCount]        = useState(0);
  const [dynamicProducts,  setDynamicProducts]  = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [sortOrder,        setSortOrder]        = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLoginPopup,   setShowLoginPopup]   = useState(false);
  const [addedItems,       setAddedItems]       = useState({});

  /* ── SCROLL REVEAL ── */
  const [visible,   setVisible]   = useState({});
  const nodeMap     = useRef({});
  const observerRf  = useRef(null);

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
      { threshold: 0.1 }
    );

    Object.values(nodeMap.current).forEach((el) => {
      if (el) observerRf.current.observe(el);
    });

    return () => observerRf.current.disconnect();
  }, []);

  /* Callback ref — safe to call after render */
  const setRef = (id) => (el) => {
    if (!el || nodeMap.current[id] === el) return;
    nodeMap.current[id] = el;
    el.setAttribute("data-rid", id);
    if (observerRf.current) observerRf.current.observe(el);
  };

  /* Spread onto any element you want to animate in */
  const anim = (id, delay = 0) => ({
    ref: setRef(id),
    style: {
      opacity:    visible[id] ? 1 : 0,
      transform:  visible[id] ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    },
  });

  /* ── DATA ── */
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/admin/products");
        const data = await res.json();
        setDynamicProducts(data.filter((p) => p.isAvailable));
      } catch {
        console.error("Failed to fetch products");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartCount((data.items || []).reduce((s, i) => s + i.quantity, 0));
      } catch {
        console.error("Failed to fetch cart");
      }
    };
    load();
  }, [token]);

  const handleAddToCart = async (product) => {
    if (!token) { setShowLoginPopup(true); return; }
    const image = product.images?.[0] || "";
    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          name:      product.name,
          price:     product.price,
          image:     image,
          category:  product.category,
          isStatic:  product.isStatic || false,
        }),
      });
      if (res.ok) {
        setCartCount((c) => c + 1);
        setAddedItems((prev) => ({ ...prev, [product._id]: true }));
        setTimeout(
          () => setAddedItems((prev) => ({ ...prev, [product._id]: false })),
          1500
        );
      }
    } catch {
      console.error("Failed to add to cart");
    }
  };

  const allProducts = [
    ...dynamicProducts.map((p) => ({ ...p, isStatic: false })),
    ...STATIC_PRODUCTS,
  ];

  const categories = [
    "All",
    ...new Set(allProducts.map((p) => p.category).filter(Boolean)),
  ];

  const filtered =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest")     return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === "oldest")     return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === "price-low")  return a.price - b.price;
    if (sortOrder === "price-high") return b.price - a.price;
    return 0;
  });

  const prevImage = (id, total) =>
    setActiveImageIndex((prev) => ({ ...prev, [id]: ((prev[id] || 0) - 1 + total) % total }));
  const nextImage = (id, total) =>
    setActiveImageIndex((prev) => ({ ...prev, [id]: ((prev[id] || 0) + 1) % total }));

  /* ── RENDER ── */
  return (
    <div className="home-root">
      <Banner />
      <Navbar cartCount={cartCount} />

      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}

      {/* ══ HERO — no reveal, visible immediately ══ */}
      <section className="hm-hero">
        <div className="hm-hero-bg" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="hm-hero-overlay" />
        <div className="hm-hero-lines" />
        <div className="hm-hero-accent" />

        <div className="hm-hero-content">
          <div className="hm-hero-pill">
            <span className="hm-hero-pill-dot" />
            Est. 1960 &nbsp;·&nbsp; Agra, India
          </div>

          <h1 className="hm-hero-h1">
            Shree<br /><em>Chemicals</em>
          </h1>

          <p className="hm-hero-sub">
            Handcrafted candles, artisan teas & pure incense — scenting
            homes across India for over six decades.
          </p>

          <div className="hm-hero-btns">
            <button
              className="hm-btn-primary"
              onClick={() => document.querySelector(".hm-products")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Products
            </button>
            <a href="/about" className="hm-btn-outline">Our Story</a>
          </div>
        </div>

        <div className="hm-scroll-cue">
          <span>Scroll</span>
          <div className="hm-scroll-line" />
        </div>
      </section>

      {/* ══ STATS BELT ══ */}
      <div className="hm-stats-belt">
        {stats.map((s, i) => (
          <div
            className="hm-stat-cell"
            key={s.label}
            {...anim(`stat-${i}`, i * 0.1)}
          >
            <div className="hm-stat-val">{s.value}</div>
            <div className="hm-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ FEATURES ══ */}
      <section className="hm-features">
        <div className="hm-features-head" {...anim("feat-head")}>
          <span className="hm-section-tag">Why Choose Us</span>
          <h2 className="hm-section-title">
            Crafted with <em>Purpose</em>
          </h2>
          <div className="hm-divider" />
        </div>

        <div className="hm-features-grid">
          {features.map((f, i) => (
            <div
              className="hm-feat-card"
              key={f.title}
              {...anim(`feat-${i}`, i * 0.13)}
            >
              <div className="hm-feat-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BANNER STRIP ══ */}
      <div className="hm-banner-strip" {...anim("banner")}>
        <h2>Pure Ingredients. <em>Timeless Fragrance.</em></h2>
        <p>Every candle, every tea, every incense stick — made with love since 1960.</p>
      </div>

      {/* ══ PRODUCTS ══ */}
      <section className="hm-products">
        <div className="hm-products-head" {...anim("prod-head")}>
          <span className="hm-section-tag">Our Collection</span>
          <h2 className="hm-section-title">Signature <em>Products</em></h2>
          <div className="hm-divider" />
          <div className="hm-product-count">{sorted.length} Products</div>
        </div>

        <div className="hm-products-layout">

          {/* FILTER SIDEBAR */}
          <div className="hm-filter-sidebar" {...anim("sidebar", 0.1)}>
            <div className="hm-filter-section">
              <h4>Sort By</h4>
              {[
                { value: "newest",     label: "Newest First"      },
                { value: "oldest",     label: "Oldest First"      },
                { value: "price-low",  label: "Price: Low → High" },
                { value: "price-high", label: "Price: High → Low" },
              ].map((opt) => (
                <label key={opt.value} className="hm-filter-option">
                  <input
                    type="radio" name="sort" value={opt.value}
                    checked={sortOrder === opt.value}
                    onChange={() => setSortOrder(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="hm-filter-section">
              <h4>Category</h4>
              {categories.map((cat) => (
                <label key={cat} className="hm-filter-option">
                  <input
                    type="radio" name="category" value={cat}
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="hm-product-grid">
            {sorted.map((p, i) => {
              const idx     = activeImageIndex[p._id] || 0;
              const imgs    = p.images || [];
              const imgSrc  = p.isStatic
                ? imgs[idx]
                : `http://localhost:5000${imgs[idx]}`;
              const isAdded = addedItems[p._id];

              return (
                <div
                  className="hm-product-card"
                  key={p._id}
                  {...anim(`prod-${p._id}`, (i % 4) * 0.08)}
                >
                  {/* IMAGE */}
                  <div className="hm-carousel-wrap">
                    {imgs.length > 0 ? (
                      <>
                        <img src={imgSrc} alt={p.name} className="hm-carousel-img" />
                        {imgs.length > 1 && (
                          <>
                            <button
                              className="hm-carousel-btn prev"
                              onClick={() => prevImage(p._id, imgs.length)}
                            >‹</button>
                            <button
                              className="hm-carousel-btn next"
                              onClick={() => nextImage(p._id, imgs.length)}
                            >›</button>
                            <div className="hm-carousel-dots">
                              {imgs.map((_, idx2) => (
                                <span
                                  key={idx2}
                                  className={`hm-dot${idx2 === idx ? " active" : ""}`}
                                  onClick={() =>
                                    setActiveImageIndex((prev) => ({ ...prev, [p._id]: idx2 }))
                                  }
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="hm-no-image">🕯️</div>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="hm-card-body">
                    {p.category && (
                      <span className="hm-product-cat">{p.category}</span>
                    )}
                    <h4 className="hm-product-name">{p.name}</h4>
                    {p.description && (
                      <p className="hm-product-desc">
                        {p.description.slice(0, 60)}…
                      </p>
                    )}
                    <p className="hm-product-price">
                      <span>₹</span>{p.price}
                    </p>

                    <div className="hm-card-footer">
                      <span className={`hm-stock-badge ${p.stock > 0 ? "in" : "out"}`}>
                        {p.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                      <button
                        className={`hm-add-btn${isAdded ? " added" : ""}`}
                        disabled={p.stock === 0}
                        onClick={() => handleAddToCart(p)}
                      >
                        {isAdded ? "✓ Added!" : "Add to Cart"}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;