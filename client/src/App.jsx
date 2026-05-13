import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Candles from "./pages/Candles";
import Tea from "./pages/Tea";
import Incense from "./pages/Incense";
import Collections from "./pages/Collections";
import Blog from "./pages/Blog";
import Samples from "./pages/Samples";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerify from "./pages/OtpVerify";
import AdminLogin from "./pages/AdminLogin";
import AdminOtpVerify from "./pages/AdminOtpVerify";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import OrderConfirmation from "./pages/OrderConfirmation";
import Feedback from "./pages/Feedback";
import FeedbackSubmit from "./pages/FeedbackSubmit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/candles" element={<Candles />} />
        <Route path="/shop/tea" element={<Tea />} />
        <Route path="/shop/incense" element={<Incense />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/samples" element={<Samples />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/verify-otp" element={<AdminOtpVerify />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/feedback/:orderId" element={<FeedbackSubmit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;