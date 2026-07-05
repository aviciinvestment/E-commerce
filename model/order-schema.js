const mongoose = require("mongoose");

// 1. Snapshot schema for items inside this specific order
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // Snapshot of name at purchase time
  pricePerItem: { type: Number, required: true }, // Snapshot of price at purchase time
  quantity: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
});

// 2. Snapshot schema for the shipping address used for this specific order
const orderAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
});

// 3. The Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema], // Embedded array snapshot
    shippingAddress: orderAddressSchema, // Embedded object snapshot
    subtotal: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    shippingCost: { type: Number, required: true },
    taxCost: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "PendingPayment",
        "Paid",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "PendingPayment",
    },
    paymentReference: { type: String, default: null }, // Stores Stripe/Paystack reference codes
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
