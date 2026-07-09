const mongoose = require("mongoose");
const Product = require("./model/Products-schema"); // Adjust path to your product schema
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB for migration...");

    // 1. Fetch all products currently in your database
    const products = await Product.find();
    let counter = 0;

    for (let product of products) {
      // 2. Only update if the product doesn't already have an SKU
      if (!product.sku) {
        counter++;

        // Generate a temporary fallback SKU using the product name or ID
        const cleanName = product.name.replace(/\s+/g, "-").toUpperCase();
        product.sku = `SKU-MIGRATE-${cleanName}-${counter}`;

        // Add the low stock threshold default value
        product.lowStockThreshold = 10;

        await product.save();
        console.log(`Updated: ${product.name} -> SKU: ${product.sku}`);
      }
    }

    console.log(
      `Success! Migration finished. Total products updated: ${counter}`,
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
