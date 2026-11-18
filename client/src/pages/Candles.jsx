import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginPopup from "../components/LoginPopup";
import "./Home.css";
import "./CategoryPage.css";

const SIZE_LABELS  = { small: "Small",  medium: "Medium",  large: "Large"  };
const SIZE_DIA     = { small: '2.5"',   medium: '3.0"',    large: '3.0"'   };
const SIZE_HEIGHT  = { small: '2.5"',   medium: '3.0"',    large: '4.0"'   };
const SIZE_BURNS   = { small: "2–3 hrs", medium: "3–4 hrs", large: "4–5 hrs" };

const Candles = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount]               = useState(0);
  const [products, setProducts]                 = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [selectedSizes, setSelectedSizes]       = useState({});
  const [sizeError, setSizeError]               = useState({});   // productId → true if user tried to add without size
  const [tooltip, setTooltip]                   = useState(null); // { productId, size }
  const [sortOrder, setSortOrder]               = useState("newest");
  const [filterType, setFilterType]             = useState("all");
  const [showLoginPopup, setShowLoginPopup]     = useState(false);
  const [addedItems, setAddedItems]             = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/admin/products");
        const data = await res.json();
        setProducts(data.filter(p => p.isAvailable && p.category === "Candles"));
      } catch { console.error("Failed to fetch candles"); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchCart = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartCount((data.items || []).reduce((s, i) => s + i.quantity, 0));
      } catch { console.error("Failed to fetch cart"); }
    };
    fetchCart();
  }, [token]);

  // Returns user-selected size, or null (no default auto-selection)
  const getSelectedSize = (product) => {
    return selectedSizes[product._id] || null;
  };

  // Price based on selected size; falls back to base price
  const getPrice = (product) => {
    if (!product.sizeOptions?.length) return product.price;
    const size      = getSelectedSize(product);
    if (!size) return product.price; // show base price when nothing selected
    const sizeEntry = product.sizeOptions.find(s => s.size === size);
    return sizeEntry ? sizeEntry.price : product.price;
  };

  const candleTypes = useMemo(() => {
    return [...new Set(products.map(p => p.candleCategory).filter(Boolean))];
  }, [products]);

  const sorted = useMemo(() => {
    let list = [...products];
    if (filterType !== "all") list = list.filter(p => p.candleCategory === filterType);
    return list.sort((a, b) => {
      if (sortOrder === "newest")     return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "oldest")     return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === "price-low")  return getPrice(a) - getPrice(b);
      if (sortOrder === "price-high") return getPrice(b) - getPrice(a);
      return 0;
    });
  }, [products, sortOrder, filterType, selectedSizes]); // eslint-disable-line

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    setSizeError(prev => ({ ...prev, [productId]: false }));
  };

  const handleAddToCart = async (product) => {
    if (!token) { setShowLoginPopup(true); return; }

    // If product has sizes, require selection
    if (product.sizeOptions?.length > 0 && !selectedSizes[product._id]) {
      setSizeError(prev => ({ ...prev, [product._id]: true }));
      return;
    }

    const selectedSize = getSelectedSize(product);
    const price        = getPrice(product);

    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id,
          name:      product.name,
          price,
          image:     product.images?.[0] || "",
          category:  product.category,
          size:      selectedSize || null,
        }),
      });
      if (res.ok) {
        setCartCount(c => c + 1);
        setAddedItems(prev => ({ ...prev, [product._id]: true }));
        setSizeError(prev => ({ ...prev, [product._id]: false }));
        setTimeout(() => setAddedItems(prev => ({ ...prev, [product._id]: false })), 1500);
      }
    } catch { console.error("Failed to add to cart"); }
  };

  const handlePrev = (id, total) =>
    setActiveImageIndex(prev => ({ ...prev, [id]: ((prev[id] || 0) - 1 + total) % total }));
  const handleNext = (id, total) =>
    setActiveImageIndex(prev => ({ ...prev, [id]: ((prev[id] || 0) + 1) % total }));

  return (
    <div>
      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}
      <Navbar cartCount={cartCount} />

      <div className="category-hero candles-hero">
        <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
        <div className="category-hero-text">
          <span className="category-emoji">🕯️</span>
          <h1>Candles</h1>
          <p>Handcrafted scented &amp; decorative candles</p>
        </div>
      </div>

      <div className="products">
        <div className="product-header">
          <h2>Our Candle Collection</h2>
          <p className="product-count">{sorted.length} Products</p>
        </div>

        <div className="products-layout">
          {/* ── FILTER SIDEBAR ── */}
          <div className="filter-sidebar">
            <div className="filter-section">
              <h4>Sort By</h4>
              {[
                { value: "newest",     label: "Newest First" },
                { value: "oldest",     label: "Oldest First" },
                { value: "price-low",  label: "Price: Low → High" },
                { value: "price-high", label: "Price: High → Low" },
              ].map(opt => (
                <label key={opt.value} className="filter-option">
                  <input type="radio" name="sort" value={opt.value}
                    checked={sortOrder === opt.value} onChange={() => setSortOrder(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>

            {candleTypes.length > 0 && (
              <div className="filter-section">
                <h4>Candle Type</h4>
                <label className="filter-option">
                  <input type="radio" name="type" value="all"
                    checked={filterType === "all"} onChange={() => setFilterType("all")} />
                  All Types
                </label>
                {candleTypes.map(type => (
                  <label key={type} className="filter-option">
                    <input type="radio" name="type" value={type}
                      checked={filterType === type} onChange={() => setFilterType(type)} />
                    {type}
                  </label>
                ))}
              </div>
            )}

            {/* Size Guide */}
            {/* Size Guide */}
<div className="filter-section size-guide">
  <h4>📐 Size Guide</h4>
  {["small", "medium", "large"].map(sz => (
    <div key={sz} className="size-guide-row">
      <strong>{SIZE_LABELS[sz]}</strong>
      <span>⌀{SIZE_DIA[sz]} × ↕{SIZE_HEIGHT[sz]}</span>
      <span className="size-guide-burn">🕯 {SIZE_BURNS[sz]}</span>
    </div>
  ))}
</div>
          </div>

          {/* ── PRODUCT GRID ── */}
          <div className="product-grid">
            {sorted.length === 0 ? (
              <div className="empty-category">No candles available yet. Check back soon! 🕯️</div>
            ) : sorted.map(p => {
              const idx          = activeImageIndex[p._id] || 0;
              const imgs         = p.images || [];
              const imgSrc       = imgs[idx] ? `http://localhost:5000${imgs[idx]}` : null;
              const selectedSize = getSelectedSize(p);
              const currentPrice = getPrice(p);
              const hasSizes     = p.sizeOptions?.length > 0;
              const hasError     = sizeError[p._id];

              return (
                <div className="product-card" key={p._id}>
                  {/* Image carousel */}
                  <div className="carousel-wrap">
                    {imgSrc ? (
                      <>
                        <img src={imgSrc} alt={p.name} className="img" />
                        {imgs.length > 1 && (
                          <>
                            <button className="carousel-btn prev" onClick={() => handlePrev(p._id, imgs.length)}>‹</button>
                            <button className="carousel-btn next" onClick={() => handleNext(p._id, imgs.length)}>›</button>
                            <div className="carousel-dots">
                              {imgs.map((_, i) => (
                                <span key={i} className={`dot ${i === idx ? "active" : ""}`}
                                  onClick={() => setActiveImageIndex(prev => ({ ...prev, [p._id]: i }))} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : <div className="no-image">🕯️</div>}
                  </div>

                  {/* Badges */}
                  <div className="product-badges">
                    {p.candleCategory && <span className="product-category">{p.candleCategory}</span>}
                    {p.fragrance      && <span className="product-fragrance">🌸 {p.fragrance}</span>}
                  </div>

                  <h4>{p.name}</h4>
                  {p.description && <p className="product-desc">{p.description.slice(0, 65)}…</p>}

                  {/* ── SIZE SELECTOR (only for candles with sizes) ── */}
                  {hasSizes && (
                    <>
                      <p className="size-select-label">
                        Select Size
                        {hasError && <span className="size-error-inline"> — please pick a size</span>}
                      </p>
                      <div className="size-selector">
                        {["small", "medium", "large"].map(sz => {
                          const sizeEntry = p.sizeOptions.find(s => s.size === sz);
                          if (!sizeEntry) return null;
                          const isActive  = selectedSize === sz;
                          return (
                            <div key={sz} className="size-btn-wrap">
                              <button
                                className={`size-btn ${isActive ? "active" : ""} ${hasError ? "error" : ""}`}
                                onClick={() => handleSizeSelect(p._id, sz)}
                              >
                                {SIZE_LABELS[sz]}
                                <span className="size-btn-price">₹{sizeEntry.price}</span>
                              </button>
                              {/* ℹ info icon with tooltip */}
                              <span
                                className="size-info-icon"
                                onMouseEnter={() => setTooltip({ productId: p._id, size: sz })}
                                onMouseLeave={() => setTooltip(null)}
                              >
                                ℹ
                                {tooltip?.productId === p._id && tooltip?.size === sz && (
                                  <div className="size-tooltip">
                                  <strong>{SIZE_LABELS[sz]}</strong>
                                  <span>⌀ {SIZE_DIA[sz]} × ↕ {SIZE_HEIGHT[sz]}</span>
                                  <span>🕯 {SIZE_BURNS[sz]}</span>
                                  <span>₹{sizeEntry.price}</span>
                                  </div>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Price */}
                  <p className="product-price">
                    {hasSizes && !selectedSize
                      ? <span className="price-from">from ₹{currentPrice}</span>
                      : <>
                          ₹{currentPrice}
                          {hasSizes && selectedSize && (
                            <span className="price-size-hint"> · {SIZE_LABELS[selectedSize]}</span>
                          )}
                        </>
                    }
                  </p>

                  <div className="product-footer">
                    <span className={`stock-badge ${p.stock > 0 ? "in" : "out"}`}>
                      {p.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                    <button
                      className={`buy-btn ${addedItems[p._id] ? "added" : ""}`}
                      disabled={p.stock === 0}
                      onClick={() => handleAddToCart(p)}
                    >
                      {addedItems[p._id] ? "✓ Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Candles;