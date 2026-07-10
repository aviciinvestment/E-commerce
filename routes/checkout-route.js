const express = require("express");
const router = express.Router();
const { CreateCheckoutSession } = require("../controller/checkout-controller");

router.post("/checkout/session", CreateCheckoutSession);

module.exports = router;
