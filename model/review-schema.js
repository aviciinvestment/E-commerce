const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating score"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text comment content"],
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false, // ⚡ 69. Verified Purchase Status indicator
    },
  },
  { timestamps: true },
);

// Ensure a user can only leave one review per individual product to prevent spam
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
