import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Feedback.css";

const API = "http://localhost:5000/api";

const StarDisplay = ({ rating }) => (
  <div className="fb-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`fb-star ${s <= rating ? "filled" : "empty"}`}>★</span>
    ))}
  </div>
);

const Feedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState({ avg: 0, total: 0, dist: [0,0,0,0,0] });

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API}/orders/feedbacks`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setFeedbacks(data);
          // compute stats
          const total = data.length;
          if (total > 0) {
            const sum  = data.reduce((a, f) => a + f.feedback.rating, 0);
            const avg  = sum / total;
            const dist = [0, 0, 0, 0, 0];
            data.forEach(f => { dist[f.feedback.rating - 1]++; });
            setStats({ avg: avg.toFixed(1), total, dist });
          }
        }
      } catch (err) {
        console.error("Failed to load feedbacks", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fb-root">
      <Navbar cartCount={0} />

      {/* ── HERO ── */}
      <section className="fb-hero">
        <div className="fb-hero-blob b1" />
        <div className="fb-hero-blob b2" />
        <div className="fb-hero-blob b3" />
        <div className="fb-hero-inner">
          <p className="fb-hero-eyebrow">What our customers say</p>
          <h1 className="fb-hero-title">
            Real Stories,<br />
            <span className="fb-hero-accent">Real Love</span>
          </h1>
          <p className="fb-hero-sub">
            Every review is from a verified purchase — no filters, no edits.
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      {!loading && stats.total > 0 && (
        <section className="fb-stats">
          <div className="fb-stats-inner">
            <div className="fb-stats-score">
              <span className="fb-big-num">{stats.avg}</span>
              <div className="fb-score-right">
                <StarDisplay rating={Math.round(stats.avg)} />
                <p>{stats.total} verified review{stats.total !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="fb-dist">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.dist[star - 1];
                const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={star} className="fb-dist-row">
                    <span className="fb-dist-label">{star}★</span>
                    <div className="fb-dist-bar-wrap">
                      <div className="fb-dist-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="fb-dist-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CARDS ── */}
      <section className="fb-cards-section">
        {loading ? (
          <div className="fb-loading">
            <div className="fb-loader" />
            <p>Loading reviews…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="fb-empty">
            <div className="fb-empty-icon">🌸</div>
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience!</p>
            <button onClick={() => navigate("/shop")}>Shop Now →</button>
          </div>
        ) : (
          <div className="fb-grid">
            {feedbacks.map((f, i) => (
              <div
                className="fb-card"
                key={f._id}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="fb-card-top">
                  <div className="fb-avatar">
                    {f.customer.firstName?.charAt(0).toUpperCase()}
                    {f.customer.lastName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="fb-card-meta">
                    <span className="fb-name">
                      {f.customer.firstName} {f.customer.lastName}
                    </span>
                    <span className="fb-date">{formatDate(f.feedback.givenAt)}</span>
                  </div>
                  <div className="fb-card-rating">
                    <StarDisplay rating={f.feedback.rating} />
                  </div>
                </div>

                {f.feedback.comment && (
                  <p className="fb-comment">"{f.feedback.comment}"</p>
                )}

                <div className="fb-products">
                  {f.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="fb-product-chip">
                      {item.name}{item.weight ? ` · ${item.weight}` : ""}
                    </span>
                  ))}
                  {f.items.length > 3 && (
                    <span className="fb-product-chip fb-more">+{f.items.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Feedback;