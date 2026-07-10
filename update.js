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
      if (!product.vendorId) {
        counter++;

        // Generate a temporary fallback SKU using the product name or ID

        product.vendorId = `6a50f48c41fb8f7447b49b1e`;



        await product.save();
        console.log(`Updated:  ${product.vendorId}`);
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
