const Vendor = require('../model/vendors-schema');
const Product = require('../model/Products-schema');
const Order = require('../model/order-schema');
const vendorService = require('../services/vendor-service');

// 80. VENDOR STORE ACCOUNT REGISTRATION
const RegisterVendorStore = async (req, res) => {
  try {
    const { userId, storeName, description, bankName, accountNumber, accountName } = req.body;

    const newVendor = new Vendor({
      userId,
      storeName,
      description,
      bankDetails: { bankName, accountNumber, accountName }
    });

    await newVendor.save();
    return res.status(201).json({ success: true, message: "Vendor application filed. Waiting for admin approval.", data: newVendor });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 83. FETCH ORDERS MATCHING SPECIFIC STORE ITEMS ONLY
const GetVendorOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // First fetch all product IDs owned by this specific vendor
    const vendorProducts = await Product.find({ vendorId }).select('_id');

    const productIdsArray = vendorProducts.map(p => p._id);

    // Find any order that contains at least one of this vendor's product IDs
    const orders = await Order.find({ "items.productId": { $in: productIdsArray }, status: 'Paid' });
    
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 85. WITHDRAWAL PLACEMENT POST
const RequestPayout = async (req, res) => {
  try {
    const { vendorId, amount } = req.body;
    const payoutReceipt = await vendorService.initiateWithdrawalRequest(vendorId, Number(amount));
    return res.status(200).json({ success: true, message: "Payout request registered cleanly.", data: payoutReceipt });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { RegisterVendorStore, GetVendorOrders, RequestPayout };