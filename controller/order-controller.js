const Order = require("../model/order-schema");
const orderService = require("../services/order-service");

// 48. CONFIRM AND PLACED ORDER AFTER PAYMENT SUCCESS
const ConfirmPaymentAndPlaceOrder = async (req, res) => {
  try {
    const { orderId, paymentReference } = req.body;
    const completedOrder = await orderService.finalizeOrderPayment(
      orderId,
      paymentReference,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Order placed successfully!",
        data: completedOrder,
      });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 50. GET USER ORDERS (TIMELINE VIEW)
const GetUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort("-createdAt");
    return res
      .status(200)
      .json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 51. GET ORDER DETAILS (INVOICE BREAKDOWN VIEW)
const GetOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Invoice lookup target not found." });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 52. CANCEL ORDER CONTROLLER
const CancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    const cancelledOrder = await orderService.processOrderCancellation(
      orderId,
      userId,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Order cancelled successfully.",
        data: cancelledOrder,
      });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 53 & 54. RETURN/REFUND CONTROLLER
const RequestReturnRefund = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    const returnedOrder = await orderService.initiateOrderReturnRequest(
      orderId,
      userId,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Return request filed for review.",
        data: returnedOrder,
      });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  ConfirmPaymentAndPlaceOrder,
  GetUserOrders,
  GetOrderDetails,
  CancelOrder,
  RequestReturnRefund,
};
