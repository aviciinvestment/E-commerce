const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true, // Prevents duplicate categories (e.g., two "Electronics")
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// This registers the model name as "Category"
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
