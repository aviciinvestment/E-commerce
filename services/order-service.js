const Order = require("../model/order-schema");
const Product = require("../model/Products-schema");
const Cart = require("../model/cart-schema");

// 48 & 49. CONFIRM PAYMENT & CREATE/FINALIZE ORDER
const finalizeOrderPayment = async (orderId, paymentReference) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order transaction not found.");
  if (order.status === "Paid") return order; // Prevent double inventory deduction

  // Loop through items and deduct physical stock count quantities atomics
  for (const item of order.items) {
    const updatedProduct = await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stockCount: -item.quantity } }, // Subtracts bought quantity
      { returnDocument: "after" },
    );

    if (updatedProduct.stockCount < 0) {
      // Safety rollback if a race condition caused stock to drop below zero
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockCount: item.quantity },
      });
      throw new Error(
        `Inventory depletion crash. '${item.name}' ran out of stock mid-transaction.`,
      );
    }
  }

  // Update order confirmation parameters
  order.status = "Paid";
  order.paymentReference = paymentReference;
  await order.save();

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
