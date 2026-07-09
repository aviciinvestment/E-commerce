const mongoose = require("mongoose");
require("../model/cartegory-schema");

const Products = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true, // ⚡ 64. SKU Management
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    stockCount: {
      type: Number,
      required: true,
      default: 0, // New signups must verify first
    },
    images: {
      type: String,
      required: false,
    },
    lowStockThreshold: { type: Number, default: 10 },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

Products.index({ name: "text", description: "text" });
Products.index({ price: 1 });
module.exports = mongoose.model("Products", Products);
