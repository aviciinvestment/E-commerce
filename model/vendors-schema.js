const mongoose = require('mongoose');
require("../model/Users-schema");


const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
  storeName: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  bankDetails: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true }
  },
  walletBalance: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Suspended'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);