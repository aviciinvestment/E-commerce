const express = require("express");
const router = express.Router();

// Import your order controllers
const {
  ConfirmPaymentAndPlaceOrder,
  GetUserOrders,
  GetOrderDetails,
  CancelOrder,
  RequestReturnRefund,
} = require("../controller/order-controller"); // Adjust path to match your controller folder layout

// 48 & 49. Confirm Payment and Finalize Order / Deduct Inventory
router.post("/orders/confirm", ConfirmPaymentAndPlaceOrder);

// 50. Get All Historical Orders for a Specific User
router.get("/orders/user/:userId", GetUserOrders);

// 51. Get Full Invoice Breakdown Details for a Single Order
router.get("/orders/:orderId", GetOrderDetails);

// 52. Cancel a Pending or Unshipped Order
router.put("/orders/cancel", CancelOrder);

// 53 & 54. File a Return and Refund Request for Delivered Items
router.post("/orders/return-request", RequestReturnRefund);

module.exports = router;
