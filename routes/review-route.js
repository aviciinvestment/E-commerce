const express = require("express");
const router = express.Router();
const {
  CreateProductReview,
  UpdateProductReview,
  DeleteProductReview,
  GetProductReviews,
} = require("../controller/review-controller");

router.post("/reviews/add", CreateProductReview);
router.put("/reviews/update", UpdateProductReview);
router.post("/reviews/delete", DeleteProductReview);
router.get("/reviews/product/:productId", GetProductReviews);

module.exports = router;
