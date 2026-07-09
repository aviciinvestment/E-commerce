const inventoryService = require("../services/inventory-service");
const Product = require("../model/Products-schema");

// 63. FETCH WAREHOUSE LEDGER SUMMARY METRICS
const GetInventoryReport = async (req, res) => {
  try {
    const reportData = await inventoryService.generateWarehouseReport();
    return res.status(200).json({ success: true, report: reportData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 64. FIND PRODUCT DETAILS BY SECURE SKU VALUE
const GetProductBySKU = async (req, res) => {
  try {
    const { skuCode } = req.params;
    const product = await Product.findOne({ sku: skuCode.toUpperCase() });

    if (!product)
      return res
        .status(404)
        .json({
          success: false,
          message: "No inventory profile found matching that SKU.",
        });
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { GetInventoryReport, GetProductBySKU };
