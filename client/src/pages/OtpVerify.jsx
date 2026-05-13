import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OtpVerify.css";

const OtpVerify = () => {
  const navigate = useNavigate();
  const [email] = useState(localStorage.getItem("verifyEmail") || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if no email — inside useEffect (correct way)
  useEffect(() => {
  const storedEmail = localStorage.getItem("verifyEmail");
  if (!storedEmail) navigate("/register");
}, [navigate]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    const otpString = otp.join("");
    if (otpString.length < 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("verifyEmail");
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError(""); setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setMessage("OTP resent! Check your email.");
      else setError(data.message);
    } catch {
      setError("Server error.");
    }
  };

  return (
    <div className="otp-wrap">

      {/* LEFT */}
      <div className="otp-left">
        <div className="candle-flame"></div>
        <div className="candle-body"></div>
        <h1 className="brand-name">Shree Chemicals</h1>
        <p className="brand-tagline">Handcrafted Candles</p>
        <div className="divider-line"></div>
        <div className="steps">
          <div className="step done"><div className="step-num">✓</div><div className="step-text"><strong>Personal Details</strong>Name, email & phone</div></div>
          <div className="step"><div className="step-num act">2</div><div className="step-text"><strong>OTP Verification</strong>Confirm your email</div></div>
          <div className="step"><div className="step-num">3</div><div className="step-text"><strong>Profile Ready</strong>Start shopping</div></div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="otp-right">
        <div className="otp-icon">✉️</div>
        <h2 className="otp-heading">Verify your email</h2>
        <p className="otp-sub">
          We sent a 6-digit OTP to<br />
          <strong>{email || "your email"}</strong>
        </p>

        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}

        <form onSubmit={handleVerify}>
          <div className="otp-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[index] && index > 0)
                    document.getElementById(`otp-${index - 1}`).focus();
                }}
              />
            ))}
          </div>

          <p className="resend-link" onClick={handleResend}>
            Didn't receive it? <span>Resend OTP</span>
          </p>

          <button type="submit" className="btn-otp" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Continue →"}
          </button>
        </form>

        <p className="back-row">
          Wrong email?{" "}
          <span onClick={() => navigate("/register")}>Go back</span>
        </p>
      </div>
    </div>
  );
};

export default OtpVerify;