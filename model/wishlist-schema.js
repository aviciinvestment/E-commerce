const mongoose = require("mongoose");
require("../model/Products-schema");
require("../model/Users-schema");
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true, // One unique wishlist document per user account
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products", // Links directly to your Products-schema
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
