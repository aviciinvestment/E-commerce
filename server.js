const express = require("express");
require("dotenv").config();
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

const PORT = process.env.PORT || 3000;
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
