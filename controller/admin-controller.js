const adminService = require('../services/admin-service');
const Review = require('../model/review-schema');

// 79. DASHBOARD ANALYTICS CONTROLLER
const FetchDashboardAnalytics = async (req, res) => {
  try {
    const dataMetrics = await adminService.getStoreMetrics();
    return res.status(200).json({ success: true, metrics: dataMetrics });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 75. UPDATE CUSTOMER ACTIVE BAN BLOCK STATUS
const UpdateUserStatus = async (req, res) => {
  try {
    const { targetUserId, isActive } = req.body;
    await adminService.toggleUserAccountStatus(targetUserId, isActive);
    return res.status(200).json({ success: true, message: `User status configuration updated safely to active: ${isActive}` });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 77. LOGISTICS STATE OVERRIDE CONTROL
const UpdateOrderStatusByAdmin = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    const updatedOrder = await adminService.adjustOrderStatus(orderId, newStatus);
    return res.status(200).json({ success: true, message: `Logistics pipeline updated to ${newStatus}`, data: updatedOrder });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 78. FORCE MODERATE REVIEW CLAIMS
const ModerateReviewForceDelete = async (req, res) => {
  try {
    const { reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId); // Direct administrative deletion override
    return res.status(200).json({ success: true, message: "Review removed cleanly by admin moderation." });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

  const AdminReviewVendor = async (req, res) => {
  try {
    const { vendorId, status } = req.body; // status: 'Approved' or 'Suspended'
    const vendor = await adminService.reviewVendorApplication(vendorId, status);
    
    return res.status(200).json({
      success: true,
      message: `Vendor application updated successfully to: ${status}`,
      data: vendor
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  };

// CONTROLLER: APPROVE VENDOR WITHDRAWAL & LOG BANK RECORD
const AdminApprovePayout = async (req, res) => {
  try {
    const { withdrawalId, transactionReference } = req.body;
    const completedPayout = await adminService.approveVendorPayoutTicket(withdrawalId, transactionReference);
    
    return res.status(200).json({
      success: true,
      message: "Vendor payout request authorized and closed successfully.",
      data: completedPayout
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}


module.exports = { FetchDashboardAnalytics, UpdateUserStatus, UpdateOrderStatusByAdmin, ModerateReviewForceDelete, AdminReviewVendor,
  AdminApprovePayout };