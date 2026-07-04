const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false }, // Helps mark primary shipping locations
});

const Users = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    addresses: [addressSchema], // ⚡ Embedded sub-document array,
    isVerified: {
      type: Boolean,
      default: false, // New signups must verify first
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    verificationToken: {
      type: Date,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Users", Users);
