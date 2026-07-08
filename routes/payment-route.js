const express = require("express");
const router = express.Router();
const {
  StartPayment,
  ProcessGatewayWebhook,
  GenerateInvoiceReceipt,
} = require("../controller/payment-controller");

router.post("/payment/initialize", StartPayment);
router.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  ProcessGatewayWebhook,
); // Webhooks require raw parsing body access
router.get("/payment/receipt/:orderId", GenerateInvoiceReceipt);

module.exports = router;
