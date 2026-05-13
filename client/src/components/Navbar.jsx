import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import logo from "../assets/chemicals/logo.png"; // adjust path as needed
import "./Navbar.css";

const Navbar = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shopOpen, setShopOpen]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [allProducts, setAllProducts]   = useState([]);

  const dropdownRef    = useRef(null);
  const shopRef        = useRef(null);
  const searchRef      = useRef(null);
  const searchInputRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/admin/products");
        const data = await res.json();
        setAllProducts(data.filter((p) => p.isAvailable));
      } catch {
        console.error("Failed to fetch products for search");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (shopRef.current && !shopRef.current.contains(e.target))
        setShopOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const t = setTimeout(() => setShopOpen(false), 0);
    return () => clearTimeout(t);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  const goTo = (path, tab) => {
    setDropdownOpen(false);
    if (tab) {
      navigate(path, { state: { tab } });
    } else {
      navigate(path);
    }
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    if (searchOpen) setSearchQuery("");
  };

  const handleResultClick = (product) => {
    const cat = product.category?.toLowerCase();
    const route =
      cat === "candles" ? "/shop/candles" :
      cat === "tea"     ? "/shop/tea"     :
      cat === "incense" ? "/shop/incense" : "/shop";
    setSearchOpen(false);
    setSearchQuery("");
    navigate(route);
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchOpen(false);
      setSearchQuery("");
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const shopCategories = [
    { label: "🕯️ Candles",       path: "/shop/candles", desc: "Scented & decorative" },
    { label: "🍵 Tea",            path: "/shop/tea",     desc: "Premium blends" },
    { label: "🌿 Incense Sticks", path: "/shop/incense", desc: "Aromatic & calming" },
  ];

  const navLinks = [
    { to: "/",            label: "Home" },
    { to: "/collections", label: "Collections" },
    { to: "/feedback",    label: "Feedback" },
    { to: "/samples",     label: "Samples" },
    { to: "/contact",     label: "Contact Us" },
    { to: "/about",       label: "About Us" },
  ];

  return (
    <div className="navbar">
      {/* ── LOGO ── */}
      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
      >
        {/* Logo image in a circle */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(124,58,237,0.35)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
          }}
        >
          <img
            src={logo}
            alt="Shree Chemicals"
            style={{ width: 36, height: 36, objectFit: "contain" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <span>Shree Chemicals</span>
      </div>

      {/* ── NAV LINKS ── */}
      <div className="nav-links">
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} className="nav-link">
            {label}
            <span className="nav-underline" />
          </Link>
        ))}

        {/* SHOP DROPDOWN */}
        <div className="shop-dropdown-wrapper" ref={shopRef}>
          <div
            className={`nav-link shop-trigger ${shopOpen ? "active" : ""}`}
            onClick={() => setShopOpen((p) => !p)}
          >
            Shop
            <span className="nav-underline" />
            <span className={`shop-arrow ${shopOpen ? "open" : ""}`}>▾</span>
          </div>

          {shopOpen && (
            <div className="shop-mega-menu">
              <p className="shop-menu-title">Browse Categories</p>
              {shopCategories.map((cat) => (
                <div
                  key={cat.path}
                  className="shop-menu-item"
                  onClick={() => navigate(cat.path)}
                >
                  <span className="shop-menu-label">{cat.label}</span>
                  <span className="shop-menu-desc">{cat.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ICONS ── */}
      <div className="nav-icons">

        {/* SEARCH */}
        <div className={`search-wrapper ${searchOpen ? "open" : ""}`} ref={searchRef}>
          <div className="search-icon" onClick={handleSearchToggle}>🔍</div>
          <div className="search-expand">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="search-result-item"
                    onClick={() => handleResultClick(product)}
                  >
                    <span className="search-result-name">{product.name}</span>
                    <span className="search-result-price">₹{product.price}</span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="search-dropdown">
                <div className="search-no-result">No products found</div>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE */}
        <div className="profile-wrapper" ref={dropdownRef}>
          {user ? (
            <>
              <div className="profile-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.firstName?.charAt(0).toUpperCase()}
                {user.lastName?.charAt(0).toUpperCase()}
              </div>
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-name">{user.firstName} {user.lastName}</div>
                  <div className="dropdown-email">{user.email}</div>
                  <hr className="dropdown-divider" />
                  <div className="dropdown-item" onClick={() => goTo("/profile", "profile")}>
                    👤 My Profile
                  </div>
                  <div className="dropdown-item" onClick={() => goTo("/profile", "orders")}>
                    📦 My Orders
                  </div>
                  <hr className="dropdown-divider" />
                  <div className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</div>
                </div>
              )}
            </>
          ) : (
            <div className="profile-icon" onClick={() => navigate("/login")} title="Login">👤</div>
          )}
        </div>

        {/* CART */}
        <div className="cart-wrapper" onClick={() => navigate("/cart")} style={{ cursor: "pointer" }}>
          🛒
          {cartCount > 0 && (
            <span className="cart-count">{cartCount > 9 ? "9+" : cartCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;