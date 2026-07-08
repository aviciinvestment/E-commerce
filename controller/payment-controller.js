const Order = require("../model/order-schema");
const User = require("../model/Users-schema");
const paymentService = require("../services/payment-service");
const orderService = require("../services/order-service"); // Reuses our Phase 10 stock-drop logic
const crypto = require("crypto");

// 55. INITIALIZE GATEWAY REDIRECT SESSION
const StartPayment = async (req, res) => {
  try {
    const { orderId, gateway } = req.body; // e.g. gateway: 'paystack' or 'flutterwave'

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({
        success: false,
        message: "Target checkout order invoice missing.",
      });
    if (order.status === "Paid")
      return res.status(400).json({
        success: false,
        message: "This transaction is already processed.",
      });

    const user = await User.findById(order.userId);

    // Call service layer to generate secure redirect url
    const paymentUrl = await paymentService.initializeTransaction(
      gateway,
      order,
      user.email,
    );

    return res.status(200).json({ success: true, paymentUrl });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 57. WEBHOOK INTERCEPTOR (SERVER-TO-SERVER IMMUTABLE CONFIRMATION)
const ProcessGatewayWebhook = async (req, res) => {
  try {
    // Security check: Verify the request actually came from Paystack's official servers
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res
        .status(401)
        .json({ message: "Unauthorized request origin blocked." });
    }

    const event = req.body;
    // 58. UPDATE ORDER STATUS ATOMICALLY
    if (event.event === "charge.success") {
      const orderId = event.data.reference;
      const gatewayTransactionRef = event.data.id;

      // Execute our Phase 10 inventory drop and update status flag to "Paid"
      await orderService.finalizeOrderPayment(orderId, gatewayTransactionRef);
    }

    // Always send a clean 200 HTTP response back to the gateway to signal reception
    return res.status(200).send("Event recorded.");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 59. GENERATE RECEIPT INVOICE DATA BREAKDOWN
const GenerateInvoiceReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const confirmedOrder = await Order.findOne({
      _id: orderId,
      status: "Paid",
    });

    if (!confirmedOrder) {
      return res.status(400).json({
        success: false,
        message: "Receipt unavailable. Order is unverified or unpaid.",
      });
    }

    return res.status(200).json({
      success: true,
      receiptMetadata: {
        receiptNumber: `REC-${confirmedOrder.paymentReference}`,
        issuedAt: confirmedOrder.updatedAt,
        customerDetails: confirmedOrder.shippingAddress,
        purchasedLines: confirmedOrder.items,
        financialLedger: {
          subTotal: confirmedOrder.subtotal,
          discount: confirmedOrder.discountApplied,
          shipping: confirmedOrder.shippingCost,
          tax: confirmedOrder.taxCost,
          totalPaid: confirmedOrder.grandTotal,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  StartPayment,
  ProcessGatewayWebhook,
  GenerateInvoiceReceipt,
};
