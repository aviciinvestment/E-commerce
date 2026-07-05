const express = require("express");
const router = express.Router();
const { CreateCoupon } = require("../controller/coupon-controler");

router.post("/coupons", CreateCoupon);

module.exports = router;
