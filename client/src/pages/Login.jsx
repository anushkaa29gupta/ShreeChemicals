import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ If already logged in, skip login page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="candle-flame"></div>
        <div className="candle-body"></div>
        <h1 className="brand-name">Shree Chemicals</h1>
        <p className="brand-tagline">Handcrafted Candles</p>
        <div className="divider-line"></div>
        <p className="left-quote">"Every flame tells a story of warmth, craft, and care."</p>
      </div>

      <div className="login-right">
        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to your account to continue</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="field-group">
            <label className="field-label">Email address</label>
            <input
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <span className="forgot-link" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </span>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider-or"><span>or</span></div>

        <p className="signup-row">
  New here?{" "}
  <span className="signup-link" onClick={() => navigate("/register")}>
    Create an account →
  </span>
</p>

<p className="maintainer-row">
  <span className="maintainer-link" onClick={() => navigate("/admin/login")}>
    🔐 Login as Maintainer
  </span>
</p>
      </div>
    </div>
  );
};

export default Login;