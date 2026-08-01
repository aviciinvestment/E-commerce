const express = require("express");
const router = express.Router();
const {
  AddToCart,
  RemoveFromCart,
  UpdateQuantity,
  GetCart,
  SyncCart, // ⚡ ADDED IMPORT
} = require("../controller/cart-controller");

router.post("/cart/add", AddToCart);
router.put("/cart/update", UpdateQuantity);
router.post("/cart/remove", RemoveFromCart);
router.get("/cart/:userId", GetCart);
router.post("/cart/sync", SyncCart); // ⚡ ADDED ROUTE

module.exports = router;
