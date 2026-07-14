const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a unique category name string"],
      unique: true,
      trim: true,
      lowercase: true, // Normalizes names like "Electronics" and "electronics"
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
