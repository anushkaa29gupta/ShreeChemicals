import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FeedbackSubmit.css";

const API = "http://localhost:5000/api";

const FeedbackSubmit = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState("");
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res  = await fetch(`${API}/orders/feedback/${orderId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  /* ── SUCCESS STATE ── */
  if (done) {
    return (
      <div className="fbs-root">
        <div className="fbs-blob b1" /><div className="fbs-blob b2" /><div className="fbs-blob b3" />
        <div className="fbs-card fbs-card--done">
          <div className="fbs-done-icon">🎉</div>
          <h2 className="fbs-done-title">Thank you!</h2>
          <p className="fbs-done-sub">
            Your feedback means the world to us.<br />
            We'll keep making things better for you.
          </p>
          <div className="fbs-done-stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`fbs-done-star ${s <= rating ? "lit" : ""}`}>★</span>
            ))}
          </div>
          <button className="fbs-shop-btn" onClick={() => navigate("/")}>
            Continue Shopping →
          </button>
        </div>
      </div>
    );
  }

  /* ── FORM STATE ── */
  const active = hovered || rating;

  return (
    <div className="fbs-root">
      <div className="fbs-blob b1" /><div className="fbs-blob b2" /><div className="fbs-blob b3" />

      <div className="fbs-card">
        {/* Brand */}
        <div className="fbs-brand">
          <span className="fbs-candle">🕯️</span>
          <span className="fbs-brand-name">Shree Chemicals</span>
        </div>

        <h1 className="fbs-title">How was your experience?</h1>
        <p className="fbs-sub">Your honest feedback helps us serve everyone better.</p>

        {/* Stars */}
        <div className="fbs-stars-wrap">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              className={`fbs-star-btn ${s <= active ? "lit" : ""}`}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => { setRating(s); setError(""); }}
              aria-label={`${s} star`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Label */}
        <div className={`fbs-star-label ${active ? "visible" : ""}`}>
          {labels[active]}
        </div>

        {/* Textbox */}
        <div className="fbs-textarea-wrap">
          <textarea
            className="fbs-textarea"
            rows={4}
            placeholder="Tell us more… (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
          />
          <span className="fbs-char-count">{comment.length}/500</span>
        </div>

        {error && <p className="fbs-error">{error}</p>}

        <button
          className={`fbs-submit-btn ${submitting ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <span className="fbs-spinner" />
          ) : (
            "Submit Feedback ✨"
          )}
        </button>

        <p className="fbs-footer-note">
          Your review will appear publicly on our website.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSubmit;