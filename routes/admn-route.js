const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../middleware/Authorization-middleware");
const {
  FetchDashboardAnalytics,
  UpdateUserStatus,
  UpdateOrderStatusByAdmin,
  ModerateReviewForceDelete,
  AdminReviewVendor,
  AdminApprovePayout,
  FetchAllUsers,
  FetchAllOrders,
  FetchAllVendors,
  FetchAllReviews,
} = require("../controller/admin-controller");

// ⚡ ALL ADMIN ASSIGNMENT PATHS PROTECTED BY RBAC MIDDLEWARE GATEKEEPERS
router.get(
  "/admin/analytics",
  authorizeRoles("admin", "super-admin"),
  FetchDashboardAnalytics,
);
router.put(
  "/admin/users/status",
  authorizeRoles("super-admin"),
  UpdateUserStatus,
); // Only Super Admin can ban users
router.put(
  "/admin/orders/logistics",
  authorizeRoles("admin", "super-admin"),
  UpdateOrderStatusByAdmin,
);
router.delete(
  "/admin/reviews/:reviewId",
  authorizeRoles("admin", "super-admin"),
  ModerateReviewForceDelete,
);
router.put(
  "/admin/vendors/review",
  authorizeRoles("admin", "super-admin"),
  AdminReviewVendor,
);
router.put(
  "/admin/vendors/payout-approve",
  authorizeRoles("super-admin"),
  AdminApprovePayout,
);
// ⚡ DATA FETCHING ROUTES
router.get(
  "/admin/users",
  authorizeRoles("admin", "super-admin"),
  FetchAllUsers,
);
router.get(
  "/admin/orders",
  authorizeRoles("admin", "super-admin"),
  FetchAllOrders,
);
router.get(
  "/admin/vendors",
  authorizeRoles("admin", "super-admin"),
  FetchAllVendors,
);
router.get(
  "/admin/reviews",
  authorizeRoles("admin", "super-admin"),
  FetchAllReviews,
);

module.exports = router;
