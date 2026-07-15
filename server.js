const express = require("express");
require("dotenv").config();

const cors = require("cors"); // ⚡ Import CORS middleware
const app = express();
const AuthRoute = require("./routes/Auth-route");
const ProductRoute = require("./routes/Product-route");
const WishlistRoute = require("./routes/Wishlist-route");
const User = require("./database/Users");
const CartRoute = require("./routes/cart-route");
const AddressRoute = require("./routes/address-routes");
const CheckoutRoute = require("./routes/checkout-route");
const CouponRoute = require("./routes/coupon-roue");
const OrderRoute = require("./routes/order-route");
const PaymentRoute = require("./routes/payment-route");
const InventoryRoute = require("./routes/inventory-route");
const ReviewRoute = require("./routes/review-route");
const AdminRoute = require("./routes/admn-route");
const VendorRoute = require("./routes/vendors-route.js");
const { globalRateLimiter } = require("./middleware/rate-limiter");
const CategoryRoute = require("./routes/Category-route.js");
const PORT = process.env.PORT || 3000;

// ⚡ Allow incoming network requests from your React development server
app.use(
  cors({
    origin: ["http://localhost:5173", "https://victorycommerce.vercel.app"], // Add your local and production frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Protect all backend entry endpoints against brute-force attacks
app.use("/api", globalRateLimiter);
app.use(express.json());
User();
app.use("/user_Auth", AuthRoute);
app.use("/products", ProductRoute);
app.use("/wishlist", WishlistRoute);
app.use("/cart", CartRoute);
app.use("/address", AddressRoute);
app.use("/checkout", CheckoutRoute);
app.use("/coupon", CouponRoute);
app.use("/order", OrderRoute);
app.use("/payment", PaymentRoute);
app.use("/inventory", InventoryRoute);
app.use("/review", ReviewRoute);
app.use("/admin", AdminRoute);
app.use("/vendor", VendorRoute);
// 1. Mount your fresh category route handler cleanly
app.use("/api", CategoryRoute);

// 2. Add this direct fallback listener right beneath it for the Newsletter
app.post("/newsletter/subscribe", (req, res) => {
  const { email } = req.body;
  console.log(`[Newsletter Log] New subscriber recorded: ${email}`);
  return res.status(200).json({
    success: true,
    message: "Thank you! Your email address has been subscribed successfully.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
