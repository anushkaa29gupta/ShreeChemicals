import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "",
    email: "", phone: "",
    whatsapp: "", alternatePhone: "",
    password: "", confirmPassword: "",
    homeAddress: "", workAddress: "",
    landmark: "", city: "", pincode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!"); return;
    }
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      setError("Pincode must be 6 digits."); return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("verifyEmail", form.email);
        navigate("/verify-otp");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="reg-wrap">
      <div className="reg-left">
        <div className="candle-flame"></div>
        <div className="candle-body"></div>
        <h1 className="brand-name">Shree Chemicals</h1>
        <p className="brand-tagline">Handcrafted Candles</p>
        <div className="steps">
          <div className="step"><div className="step-num act">1</div><div className="step-text"><strong>Personal Details</strong>Name, email & phone</div></div>
          <div className="step"><div className="step-num">2</div><div className="step-text"><strong>OTP Verification</strong>Confirm your email</div></div>
          <div className="step"><div className="step-num">3</div><div className="step-text"><strong>Profile Ready</strong>Start shopping</div></div>
        </div>
      </div>

      <div className="reg-right">
        <h2 className="reg-heading">Create account</h2>
        <p className="reg-sub">Join us and start your candle journey</p>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="section-label">Personal information</div>
          <div className="row2">
            <div className="field-g"><label className="f-label">First name</label><input className="f-input" name="firstName" placeholder="Aarav" value={form.firstName} onChange={handleChange} required /></div>
            <div className="field-g"><label className="f-label">Last name</label><input className="f-input" name="lastName" placeholder="Sharma" value={form.lastName} onChange={handleChange} required /></div>
          </div>
          <div className="field-g"><label className="f-label">Email address</label><input className="f-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required /></div>

          <div className="row2">
            <div className="field-g"><label className="f-label">Phone number</label><input className="f-input" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required /></div>
            <div className="field-g"><label className="f-label">WhatsApp number <span className="f-optional">(if different)</span></label><input className="f-input" name="whatsapp" type="tel" placeholder="Same as phone if blank" value={form.whatsapp} onChange={handleChange} /></div>
          </div>

          <div className="field-g"><label className="f-label">Alternate phone <span className="f-optional">(optional)</span></label><input className="f-input" name="alternatePhone" type="tel" placeholder="+91 98765 00000" value={form.alternatePhone} onChange={handleChange} /></div>

          <div className="row2">
            <div className="field-g"><label className="f-label">Password</label><input className="f-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required /></div>
            <div className="field-g"><label className="f-label">Confirm password</label><input className="f-input" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required /></div>
          </div>

          <div className="section-label">Address details</div>
          <div className="field-g"><label className="f-label">Home address</label><input className="f-input" name="homeAddress" placeholder="House no, Street, Area" value={form.homeAddress} onChange={handleChange} /></div>
          <div className="field-g"><label className="f-label">Work address <span className="f-optional">(optional)</span></label><input className="f-input" name="workAddress" placeholder="Office / Work location" value={form.workAddress} onChange={handleChange} /></div>
          <div className="row2">
            <div className="field-g"><label className="f-label">Landmark</label><input className="f-input" name="landmark" placeholder="Near temple, mall..." value={form.landmark} onChange={handleChange} /></div>
            <div className="field-g"><label className="f-label">City</label><input className="f-input" name="city" placeholder="Agra" value={form.city} onChange={handleChange} /></div>
          </div>
          <div className="field-g">
            <label className="f-label">Pincode</label>
            <input className="f-input" name="pincode" type="text" maxLength={6} placeholder="282005" value={form.pincode} onChange={handleChange} />
          </div>

          <p className="delivery-note">
            📦 Your address details will be used for order delivery. Please ensure they are accurate.
          </p>

          <button type="submit" className="btn-reg" disabled={loading}>
            {loading ? "Creating account..." : "Create Account & Verify →"}
          </button>
        </form>
        <p className="signin-row">Already have an account? <span className="signin-lnk" onClick={() => navigate("/login")}>Sign in →</span></p>
      </div>
    </div>
  );
};

export default Register;