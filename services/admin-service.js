const User = require('../model/Users-schema');
const Product = require('../model/Products-schema');
const Order = require('../model/order-schema');
const Review = require('../model/review-schema');
const Vendor = require('../model/vendors-schema');
const Withdrawal = require('../model/withdrawal-schema');

class AdminService {
  // ==========================================
  // 79. COMPILE DASHBOARD ANALYTICS
  // ==========================================
  async getStoreMetrics() {
    // 1. Calculate lifetime revenue metrics from completed orders
    const financialAggregation = await Order.aggregate([
      { $match: { status: 'Paid' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$grandTotal' },
          totalOrdersCount: { $sum: 1 }
        }
      }
    ]);

    const activeUsers = await User.countDocuments({ isActive: true });
    const totalItemsCount = await Product.countDocuments();
    const metrics = financialAggregation[0] || { totalEarnings: 0, totalOrdersCount: 0 };

    return {
      revenue: metrics.totalEarnings,
      totalOrdersPlaced: metrics.totalOrdersCount,
      totalRegisteredCustomers: activeUsers,
      catalogInventorySize: totalItemsCount
    };
  }

  // ==========================================
  // 75. MANAGE USERS (Ban / Unban Account Profiles)
  // ==========================================
  async toggleUserAccountStatus(targetUserId, statusBool) {
    return await User.findByIdAndUpdate(targetUserId, { isActive: statusBool }, { new: true });
  }

  // ==========================================
  // 77. MANAGE ORDERS (Logistics State Overrides)
  // ==========================================
  async adjustOrderStatus(orderId, newStatus) {
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) throw new Error("Invalid logistics status assignment configuration.");

    return await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
  }


  // ==========================================
  // 80. ADMIN APPROVE / REJECT VENDOR STORE
  // ==========================================
  async reviewVendorApplication(vendorId, decisionStatus) {
    const validDecisions = ['Approved', 'Suspended'];
    if (!validDecisions.includes(decisionStatus)) {
      throw new Error("Invalid vendor application status assignment designation.");
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: { status: decisionStatus } },
      {returnDocument: 'after', runValidators: true }
    );

    if (!updatedVendor) throw new Error("Target vendor application profile missing.");
    return updatedVendor;
  }

  // ==========================================
  // 85. ADMIN APPROVE / AUTHORIZE PAYOUT TRANSFER
  // ==========================================
  async approveVendorPayoutTicket(withdrawalId, transactionReference) {
    // 1. Locate the withdrawal ticket
    const ticket = await Withdrawal.findById(withdrawalId);
    if (!ticket) throw new Error("Withdrawal payout target record missing.");
    
    // Guard Rails: Prevent duplicate payouts or approving already finalized receipts
    if (ticket.status !== 'Pending') {
      throw new Error(`This payout ticket has already been processed as ${ticket.status}.`);
    }

    if (!transactionReference) {
      throw new Error("A clear banking ledger transaction reference code is required for authorization.");
    }

    // 2. Update the payout status to Approved and append bank receipt wire tags
    ticket.status = 'Approved';
    ticket.transactionReference = transactionReference;
    await ticket.save();

    return ticket;
  }
}

module.exports = new AdminService();