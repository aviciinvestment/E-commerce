const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One unique wishlist document per user account
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Links directly to your Products-schema
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
