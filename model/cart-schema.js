const mongoose = require("mongoose");
require("../model/Users-schema");
require("../model/Products-schema");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products", // Links to your Product schema
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
    default: 1,
  },

  pricePerItem: {
    type: Number,
    required: true,
  },
  lineTotal: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true, // One unique cart per user profile
    },
    items: [cartItemSchema],
    cartTotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

//module.exports = mongoose.model("Cart", cartSchema);
// Change your old export line to this safe pattern:
module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
