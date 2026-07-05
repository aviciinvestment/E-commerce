const express = require("express");
const router = express.Router();
const { CreateCheckoutSession } = require("../controller/checkout-Controller");

router.post("/checkout/session", CreateCheckoutSession);

module.exports = router;
