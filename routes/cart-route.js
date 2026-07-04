const express = require("express");
const router = express.Router();
const {
  AddToCart,
  RemoveFromCart,
  UpdateQuantity,
  GetCart,
} = require("../controller/cart-controller");

router.post("/cart/add", AddToCart);
router.put("/cart/update", UpdateQuantity);
router.post("/cart/remove", RemoveFromCart);
router.get("/cart/:userId", GetCart);

module.exports = router;
