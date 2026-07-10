const Vendor = require('../model/vendors-schema');
const Product = require('../model/Products-schema');
const Order = require('../model/order-schema');
const Withdrawal = require('../model/withdrawal-schema');

class VendorService {
  // =========================================================================
  // 84 & 86. PAYOUT SETTLEMENT & COMMISSION CALCULATION PATTERN
  // =========================================================================
  /**
   * Processes split payouts across marketplace stores when an order is completed.
   * @param {Object} orderDocument - The completed Paid order snapshot from database
   */
  async processOrderCommissionsSplit(orderDocument) {
    const platformCommissionRate = 0.10; // 10% marketplace platform cut

    for (const item of orderDocument.items) {
      // Find the parent product to look up who owns it
      const product = await Product.findById(item.productId);
      if (!product || !product.vendorId) continue;

      const totalItemRevenue = item.lineTotal;
      const commissionFee = totalItemRevenue * platformCommissionRate;
      const vendorNetEarnings = totalItemRevenue - commissionFee;

      // Credit the vendor's wallet balance using atomic increments
      await Vendor.findByIdAndUpdate(
        product.vendorId,
        { $inc: { walletBalance: Number(vendorNetEarnings.toFixed(2)) } }
      );
      
      console.log(`[Marketplace Split] Vendor ${product.vendorId} credited +$${vendorNetEarnings.toFixed(2)}. Platform took $${commissionFee.toFixed(2)} commission fee.`);
    }
  }

  // =========================================================================
  // 85. PROCESS VENDOR WITHDRAWAL CLAIMS
  // =========================================================================
  async initiateWithdrawalRequest(vendorId, requestAmount) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || vendor.status !== 'Approved') throw new Error("Vendor store is unverified or suspended.");
    
    if (vendor.walletBalance < requestAmount) {
      throw new Error("Insufficient wallet balance available for withdrawal processing.");
    }

    // Deduct from wallet balance immediately to lock the funds down
    vendor.walletBalance -= requestAmount;
    await vendor.save();

    const payoutTicket = new Withdrawal({
      vendorId,
      amount: requestAmount,
      status: 'Pending'
    });

    await payoutTicket.save();
    return payoutTicket;
  }
}

module.exports = new VendorService();