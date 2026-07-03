const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// 1. Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Cloudinary Storage Rules
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce_products", // The folder name inside your Cloudinary account
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // Optional: resizes images automatically
  },
});

// 3. Initialize Multer with Cloudinary Storage
const upload = multer({ storage: storage });

module.exports = upload;
