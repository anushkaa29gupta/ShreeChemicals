import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass) => {
  if (pass.length < 8 || pass.length > 20) return "Password must be 8-20 characters.";
  if (!/[A-Z]/.test(pass)) return "Must include at least one capital letter.";
  if (!/[!@#$%^&*(),.?:{}|<>]/.test(pass)) return "Must include at least one special character.";
  return null;
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const passError = validatePassword(password);
    if (passError) { setError(passError); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminEmail", email);
        navigate("/admin/verify-otp");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-box">
        <div className="admin-brand">
          <div className="admin-candle-flame"></div>
          <div className="admin-candle-body"></div>
          <h1>Shree Chemicals</h1>
          <p>Admin Portal</p>
        </div>

        <h2>Admin Sign In</h2>
        <p className="admin-sub">Restricted access — authorized personnel only</p>

        {error && <p className="admin-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="admin-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="admin@shreechemicals.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <small>8-20 chars, one capital, one special character</small>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;