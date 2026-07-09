const express = require("express");
const router = express.Router();
const {
  GetInventoryReport,
  GetProductBySKU,
} = require("../controller/inventory-controller");

// Admin Inventory Dashboard Management Paths
router.get("/inventory/report", GetInventoryReport);
router.get("/inventory/sku/:skuCode", GetProductBySKU);

module.exports = router;
