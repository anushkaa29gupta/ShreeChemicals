import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/chemicals/logo.png";
import "./Navbar.css";

const Navbar = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shopOpen,     setShopOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [allProducts,  setAllProducts]  = useState([]);
  const [scrolled,     setScrolled]     = useState(false);

  const dropdownRef    = useRef(null);
  const shopRef        = useRef(null);
  const searchRef      = useRef(null);
  const searchInputRef = useRef(null);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── fetch products for search ── */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch("https://shreechemicals.onrender.com/api/admin/products");
        const data = await res.json();
        setAllProducts(data.filter((p) => p.isAvailable));
      } catch { console.error("Failed to fetch products for search"); }
    };
    fetchProducts();
  }, []);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (shopRef.current    && !shopRef.current.contains(e.target))      setShopOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── focus search input when opened ── */
  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  /* ── search results ── */
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  const goTo = (path, tab) => {
    setDropdownOpen(false);
    tab ? navigate(path, { state: { tab } }) : navigate(path);
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    if (searchOpen) setSearchQuery("");
  };

  const handleResultClick = (product) => {
    const cat   = product.category?.toLowerCase();
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
    if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
  };

  const shopCategories = [
    { label: "🕯️ Candles",       path: "/shop/candles", desc: "Scented & decorative" },
    { label: "🍵 Tea",            path: "/shop/tea",     desc: "Premium blends"       },
    { label: "🌿 Incense Sticks", path: "/shop/incense", desc: "Aromatic & calming"   },
  ];

  const navLinks = [
    { to: "/",            label: "Home"        },
    { to: "/collections", label: "Collections" },
    { to: "/feedback",    label: "Feedback"    },
    { to: "/samples",     label: "Samples"     },
    { to: "/contact",     label: "Contact Us"  },
    { to: "/about",       label: "About Us"    },
  ];

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="navbar-inner">

        {/* ── LOGO ── */}
        <div className="navbar-logo" onClick={() => { setShopOpen(false); navigate("/"); }}>
          <div className="navbar-logo-circle">
            <img
              src={logo}
              alt="Shree Chemicals"
              className="navbar-logo-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <span className="navbar-brand-name">Shree Chemicals</span>
        </div>

        {/* ── NAV LINKS ── */}
        <div className="nav-links">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${location.pathname === to ? " active-link" : ""}`}
              onClick={() => setShopOpen(false)}
            >
              {label}
              <span className="nav-underline" />
            </Link>
          ))}

          {/* SHOP DROPDOWN */}
          <div className="shop-dropdown-wrapper" ref={shopRef}>
            <div
              className={`nav-link shop-trigger${shopOpen ? " active" : ""}`}
              onClick={() => setShopOpen((p) => !p)}
            >
              Shop
              <span className={`shop-arrow${shopOpen ? " open" : ""}`}>▾</span>
              <span className="nav-underline" />
            </div>

            {shopOpen && (
              <div className="shop-mega-menu">
                <p className="shop-menu-title">Browse Categories</p>
                {shopCategories.map((cat) => (
                  <div
                    key={cat.path}
                    className="shop-menu-item"
                    onClick={() => { setShopOpen(false); navigate(cat.path); }}
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
          <div className={`search-wrapper${searchOpen ? " open" : ""}`} ref={searchRef}>
            <button className="nav-icon-btn" onClick={handleSearchToggle} title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
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
                    <div key={product._id} className="search-result-item" onClick={() => handleResultClick(product)}>
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
                    <div className="dropdown-item" onClick={() => goTo("/profile", "profile")}>👤 My Profile</div>
                    <div className="dropdown-item" onClick={() => goTo("/profile", "orders")}>📦 My Orders</div>
                    <hr className="dropdown-divider" />
                    <div className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</div>
                  </div>
                )}
              </>
            ) : (
              <button className="nav-icon-btn" onClick={() => navigate("/login")} title="Login">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
          </div>

          {/* CART */}
          <button className="nav-icon-btn cart-btn" onClick={() => navigate("/cart")} title="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-count">{cartCount > 9 ? "9+" : cartCount}</span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;