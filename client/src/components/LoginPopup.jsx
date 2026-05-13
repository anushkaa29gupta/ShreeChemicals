import { useNavigate } from "react-router-dom";
import "./LoginPopup.css";

const LoginPopup = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>

        <button className="popup-close" onClick={onClose}>✕</button>

        <div className="popup-candle">
          <div className="popup-flame"></div>
          <div className="popup-candle-body"></div>
        </div>

        <h2>Sign in to continue</h2>

        <p className="popup-quote">
          "Every flame begins with a spark — your journey starts with a sign in."
        </p>

        <p className="popup-msg">
          Please login to add items to your cart and enjoy a personalized shopping experience.
        </p>

        <div className="popup-actions">
          <button className="popup-login-btn" onClick={() => navigate("/login")}>
            Sign In →
          </button>
          <button className="popup-register-btn" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPopup;