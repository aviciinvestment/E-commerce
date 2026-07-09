const Product = require("../model/Products-schema");

class InventoryService {
  // ==========================================
  // 60 & 62. REDUCE STOCK & CHECK FOR LOW ALERTS
  // ==========================================
  async deductStock(productId, quantity) {
    // Atomic subtraction ensures data safety during concurrent hits
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stockCount: -quantity } },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) throw new Error("Inventory target asset missing.");

    // 62. Trigger alert systems if stock dips past thresholds
    if (updatedProduct.stockCount <= updatedProduct.lowStockThreshold) {
      console.warn(
        `[LOW STOCK ALERT] ${updatedProduct.name} (SKU: ${updatedProduct.sku}) is running low! Only ${updatedProduct.stockCount} left.`,
      );
      // In production, you would trigger an email or Slack alert notification here
    }

    return updatedProduct;
  }

  // ==========================================
  // 61. RESTORE STOCK ON REVERSALS
  // ==========================================
  async restockItems(productId, quantity) {
    return await Product.findByIdAndUpdate(
      productId,
      { $inc: { stockCount: quantity } },
      { new: true },
    );
  }

  // ==========================================
  // 63. GENERATE INVENTORY AUDIT REPORTS
  // ==========================================
  async generateWarehouseReport() {
    const metricsAggregation = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalUniqueSKUs: { $sum: 1 },
          totalPhysicalStock: { $sum: "$stockCount" },
          totalInventoryValue: {
            $sum: { $multiply: ["$price", "$stockCount"] },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$stockCount", 0] }, 1, 0] },
          },
        },
      },
    ]);

    // Handle initial state fallback conditions if collection is empty
    return (
      metricsAggregation[0] || {
        totalUniqueSKUs: 0,
        totalPhysicalStock: 0,
        totalInventoryValue: 0,
        outOfStockCount: 0,
      }
    );
  }
}

module.exports = new InventoryService();
