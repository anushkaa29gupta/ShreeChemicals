import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginPopup from "../components/LoginPopup";
import "./Home.css";
import "./CategoryPage.css";

const Incense = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [sortOrder, setSortOrder] = useState("newest");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [addedItems, setAddedItems] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch$ = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/products");
        const data = await res.json();
        setProducts(data.filter((p) => p.isAvailable && p.category === "Incense"));
      } catch { console.error("Failed to fetch incense products"); }
    };
    fetch$();
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartCount((data.items || []).reduce((s, i) => s + i.quantity, 0));
      } catch { console.error("Failed to fetch cart"); }
    };
    fetchCart();
  }, [token]);

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === "price-low") return a.price - b.price;
      if (sortOrder === "price-high") return b.price - a.price;
      return 0;
    });
  }, [products, sortOrder]);

  const handleAddToCart = async (product) => {
    if (!token) { setShowLoginPopup(true); return; }
    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id, name: product.name,
          price: product.price, image: product.images?.[0] || "",
          category: product.category,
        }),
      });
      if (res.ok) {
        setCartCount((c) => c + 1);
        setAddedItems((prev) => ({ ...prev, [product._id]: true }));
        setTimeout(() => setAddedItems((prev) => ({ ...prev, [product._id]: false })), 1500);
      }
    } catch { console.error("Failed to add to cart"); }
  };

  const handlePrev = (id, total) =>
    setActiveImageIndex((prev) => ({ ...prev, [id]: ((prev[id] || 0) - 1 + total) % total }));
  const handleNext = (id, total) =>
    setActiveImageIndex((prev) => ({ ...prev, [id]: ((prev[id] || 0) + 1) % total }));

  return (
    <div>
      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}
      <Navbar cartCount={cartCount} />

      <div className="category-hero incense-hero">
        <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
        <div className="category-hero-text">
          <span className="category-emoji">🌿</span>
          <h1>Incense Sticks</h1>
          <p>Aromatic & calming fragrances for your space</p>
        </div>
      </div>

      <div className="products">
        <div className="product-header">
          <h2>Our Incense Collection</h2>
          <p className="product-count">{sorted.length} Products</p>
        </div>

        <div className="products-layout">
          <div className="filter-sidebar">
            <div className="filter-section">
              <h4>Sort By</h4>
              {[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "price-low", label: "Price: Low → High" },
                { value: "price-high", label: "Price: High → Low" },
              ].map((opt) => (
                <label key={opt.value} className="filter-option">
                  <input type="radio" name="sort" value={opt.value}
                    checked={sortOrder === opt.value} onChange={() => setSortOrder(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {sorted.length === 0 ? (
              <div className="empty-category">No incense products available yet. Check back soon! 🌿</div>
            ) : sorted.map((p) => {
              const idx = activeImageIndex[p._id] || 0;
              const imgs = p.images || [];
              const imgSrc = `http://localhost:5000${imgs[idx]}`;
              return (
                <div className="product-card" key={p._id}>
                  <div className="carousel-wrap">
                    {imgs.length > 0 ? (
                      <>
                        <img src={imgSrc} alt={p.name} className="img" />
                        {imgs.length > 1 && (
                          <>
                            <button className="carousel-btn prev" onClick={() => handlePrev(p._id, imgs.length)}>‹</button>
                            <button className="carousel-btn next" onClick={() => handleNext(p._id, imgs.length)}>›</button>
                            <div className="carousel-dots">
                              {imgs.map((_, i) => (
                                <span key={i} className={`dot ${i === idx ? "active" : ""}`}
                                  onClick={() => setActiveImageIndex((prev) => ({ ...prev, [p._id]: i }))} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : <div className="no-image">🌿</div>}
                  </div>
                  <span className="product-category">{p.category}</span>
                  <h4>{p.name}</h4>
                  {p.description && <p className="product-desc">{p.description.slice(0, 60)}...</p>}
                  <p className="product-price">₹{p.price}</p>
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

export default Incense;