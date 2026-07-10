const Order = require("../model/order-schema");
const Product = require("../model/Products-schema");
const Cart = require("../model/cart-schema");
const inventoryService = require("./inventory-service");
const notificationService = require('../services/notification-service');
const User = require('../model/Users-schema')
const vendorService = require('./vendor-service');


// 48 & 49. CONFIRM PAYMENT & CREATE/FINALIZE ORDER
const finalizeOrderPayment = async (userId,orderId, paymentReference) => {
  const order = await Order.findById(orderId);
  const user = await User.findById(userId);
  if (!order) throw new Error("Order transaction not found.");
  if (order.status === "Paid") return order; // Prevent double inventory deduction

  // Loop through items and deduct physical stock count quantities atomics
  for (const item of order.items) {
    // ⚡ Seamless cross-module interaction! Reduces stock and runs low warnings automatically
    await inventoryService.deductStock(item.productId, item.quantity);
  }





  // Update order confirmation parameters
  order.status = "Paid";
  order.paymentReference = paymentReference;
  await order.save();

  // ⚡ Trigger commission payouts automatically for marketplace vendors!
await vendorService.processOrderCommissionsSplit(order); 

  // Inside your Order Confirmation Controller...
const textMessage = `Order Confirmed! Your package reference is #${order._id}. Total Paid: $${order.grandTotal}.`;
const invoiceHTML = `<h3>Thank you for your payment!</h3><p>Order ID: ${order._id}</p>`;

notificationService.sendSMS("+2347067424246", textMessage);
notificationService.sendEmail(user.email, "Your Purchase Invoice Receipt", invoiceHTML);

  // Clear out the user's shopping cart since the transaction is finished
  await Cart.findOneAndDelete({ userId: order.userId });

  return order;
};

// 52. CANCEL ORDER
const processOrderCancellation = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new Error("Order profile mismatch or not found.");

  // Guard rails: cannot cancel if product is already en route with couriers
  if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
    throw new Error(
      `Cannot cancel order. It has already been processed as ${order.status}.`,
    );
  }

  // If order was already paid, restock items back into product inventory
  if (order.status === "Paid") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockCount: item.quantity },
      });
    }
  }

  order.status = "Cancelled";
  await order.save();
  return order;
};

// 53 & 54. RETURN & REFUND REQUEST PIPELINE
const initiateOrderReturnRequest = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new Error("Order not found.");

  if (order.status !== "Delivered") {
    throw new Error(
      "You can only request returns on items that have been successfully delivered.",
    );
  }

  order.status = "RefundRequest";
  await order.save();
  return order;
};

module.exports = {
  finalizeOrderPayment,
  processOrderCancellation,
  initiateOrderReturnRequest,
};
