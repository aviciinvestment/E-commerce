const Coupon = require("../model/coupon-schema");

// CONTROLLER: Create a New Promotional Coupon
const CreateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate } =
      req.body;

    // 1. Core input verification checks
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing parameters. Code, discountType, discountValue, and expiryDate are required.",
      });
    }

    // 2. Prevent creating duplicate coupon codes
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: `A coupon with the code '${code.toUpperCase()}' already exists.`,
      });
    }

    // 3. Prevent setting negative discount allocations
    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value allocation must be greater than zero.",
      });
    }

    // 4. Create and save the new asset
    const newCoupon = new Coupon({
      code: code.toUpperCase(), // System rule: always save coupon strings in uppercase
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      expiryDate: new Date(expiryDate), // Ensures input string converts to native ISODate format
      isActive: true,
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: "Promotional coupon created successfully!",
      data: newCoupon,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { CreateCoupon };
