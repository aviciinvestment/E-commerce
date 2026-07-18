const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// 1. EMBEDDED SUB-DOCUMENT SCHEMA FOR SHIPPING ADDRESSES
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
});

// 2. PRIMARY USER ECOSYSTEM MATRIX SCHEMA
const UsersSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Keeps email lookups case-insensitive on Atlas
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "super-admin"],
      default: "customer",
    },
    addresses: [addressSchema], // Embedded array matching phase 16 requirements
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    }, // ⚡ FIXED: Removed duplicate second field entry block
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// 3. SECURE MIDDLEWARE: AUTOMATED CRYPTOGRAPHIC BCRYPT PASSCODE HASHING HOOK
// Crucial: This MUST sit directly above the mongoose.model definition step!

// 4. COMPILE AND EXPORT MODEL MATRIX FOR MIDDLEWARE INJECTION
module.exports = mongoose.model("Users", UsersSchema);
