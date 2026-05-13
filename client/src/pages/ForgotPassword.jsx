import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // STEP 1 - Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStep(2); setMessage(data.message); }
      else setError(data.message);
    } catch {
      setError("Server error. Please try again.");
    }
  };

  // STEP 2 - Verify OTP
  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const otpString = otp.join("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (res.ok) setStep(3);
      else setError(data.message);
    } catch {
      setError("Server error. Please try again.");
    }
  };

  // STEP 3 - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) setStep(4);
      else setError(data.message);
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="fp-wrap">

      {/* LEFT PANEL */}
      <div className="fp-left">
        <div className="candle-flame"></div>
        <div className="candle-body"></div>
        <h1 className="brand-name">Shree Chemicals</h1>
        <p className="brand-tagline">Handcrafted Candles</p>
        <div className="divider-line"></div>
        <div className="steps-fp">
          <div className="sfp"><div className={`snum ${step >= 1 ? "act" : ""}`}>1</div><div className="stxt"><strong>Enter Email</strong>We'll send you an OTP</div></div>
          <div className="sfp"><div className={`snum ${step >= 2 ? "act" : ""}`}>2</div><div className="stxt"><strong>Verify OTP</strong>6-digit code from email</div></div>
          <div className="sfp"><div className={`snum ${step >= 3 ? "act" : ""}`}>3</div><div className="stxt"><strong>New Password</strong>Set your new password</div></div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="fp-right">
        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}

        {/* STEP 1 - Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <h2 className="fp-heading">Forgot password?</h2>
            <p className="fp-sub">Enter your email and we'll send you a reset OTP</p>
            <div className="field-g">
              <label className="f-label">Email address</label>
              <input className="f-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-fp">Send OTP →</button>
            <p className="back-link">Remember password? <span onClick={() => navigate("/login")}>Sign in</span></p>
          </form>
        )}

        {/* STEP 2 - OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <h2 className="fp-heading">Check your email</h2>
            <p className="fp-sub">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
            <div className="otp-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  className="otp-box"
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0)
                      document.getElementById(`otp-${index - 1}`).focus();
                  }}
                  required
                />
              ))}
            </div>
            <p className="resend" onClick={handleSendOtp}>Didn't receive? Resend OTP</p>
            <button type="submit" className="btn-fp">Verify OTP →</button>
            <p className="back-link" onClick={() => setStep(1)}>← Back</p>
          </form>
        )}

        {/* STEP 3 - New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <h2 className="fp-heading">Set new password</h2>
            <p className="fp-sub">Choose a strong password for your account</p>
            <div className="field-g">
              <label className="f-label">New password</label>
              <input className="f-input" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="field-g">
              <label className="f-label">Confirm new password</label>
              <input className="f-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-fp">Reset Password →</button>
          </form>
        )}

        {/* STEP 4 - Success */}
        {step === 4 && (
          <div className="success-wrap">
            <div className="success-icon">🕯️</div>
            <h2 className="fp-heading">Password Reset!</h2>
            <p className="fp-sub">Your password has been reset successfully.</p>
            <button className="btn-fp" onClick={() => navigate("/login")}>Back to Sign In →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;