import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminOtpVerify = () => {
  const navigate = useNavigate();
  const [email] = useState(localStorage.getItem("adminEmail") || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!email) navigate("/admin/login");
}, [email, navigate]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`adm-otp-${index + 1}`).focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    const otpString = otp.join("");
    if (otpString.length < 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        localStorage.removeItem("adminEmail");
        navigate("/admin/dashboard");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server error.");
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

        <h2>Verify OTP</h2>
        <p className="admin-sub">6-digit code sent to <strong>{email}</strong></p>

        {error && <p className="admin-error">{error}</p>}

        <form onSubmit={handleVerify}>
          <div className="admin-otp-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`adm-otp-${index}`}
                className="admin-otp-box"
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[index] && index > 0)
                    document.getElementById(`adm-otp-${index - 1}`).focus();
                }}
              />
            ))}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Access Dashboard →"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "12px", color: "#8a7a6a", cursor: "pointer" }}
          onClick={() => navigate("/admin/login")}>
          ← Back to login
        </p>
      </div>
    </div>
  );
};

export default AdminOtpVerify;