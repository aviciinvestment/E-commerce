const express = require("express");
const router = express.Router();
const {
  AddToWishlist,
  RemoveWishlistItem,
  GetWishlist,
} = require("../controller/wishlist-controller");

router.post("/wishlist/add", AddToWishlist);
router.post("/wishlist/remove", RemoveWishlistItem);
router.get("/wishlist/:userId", GetWishlist);

module.exports = router;
