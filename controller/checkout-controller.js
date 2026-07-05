const Cart = require("../model/cart-schema");
const Product = require("../model/Products-schema");
const User = require("../model/Users-schema");
const Coupon = require("../model/coupon-schema");
const Order = require("../model/order-schema"); // Assuming you have an Order model for historical data

const CreateCheckoutSession = async (req, res) => {
  try {
    const { userId, addressId, couponCode } = req.body;

    // ==========================================
    // 42. VALIDATE CART & INTEGRITY CHECK
    // ==========================================
    // Fetch user's cart and populate raw product data fields
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Checkout failed. Your shopping cart is empty.",
      });
    }

    // ==========================================
    // 43. VALIDATE STOCK & RE-VERIFY LIVE PRICES
    // ==========================================
    let calculatedSubtotal = 0;
    const validatedItemsManifest = [];

    for (const item of cart.items) {
      const liveProductDetails = item.productId;

      // Check if product was soft-deleted or hidden
      if (!liveProductDetails || !liveProductDetails.isActive) {
        return res.status(400).json({
          success: false,
          message: `Item '${liveProductDetails?.name || "Unknown"}' is no longer available.`,
        });
      }

      // Check if physical inventory can fulfill the quantity order
      if (liveProductDetails.stockCount < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for '${liveProductDetails.name}'. Only ${liveProductDetails.stockCount} left in stock.`,
        });
      }

      // Compute line item values using actual system prices (ignores forged client metrics)
      const exactLineTotal = liveProductDetails.price * item.quantity;
      calculatedSubtotal += exactLineTotal;

      // Push validated information into a temporary checkout array
      validatedItemsManifest.push({
        productId: liveProductDetails._id,
        name: liveProductDetails.name,
        quantity: item.quantity,
        pricePerItem: liveProductDetails.price,
        lineTotal: exactLineTotal,
      });
    }

    // ==========================================
    // 46. APPLY COUPONS (DISCOUNT MATRIX)
    // ==========================================
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon || coupon.expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Promo coupon code is invalid or expired.",
        });
      }

      if (calculatedSubtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Coupon requires a minimum order amount of $${coupon.minOrderAmount}.`,
        });
      }

      // Evaluate markdown strategy types
      if (coupon.discountType === "percentage") {
        discountAmount = calculatedSubtotal * (coupon.discountValue / 100);
      } else if (coupon.discountType === "fixed") {
        discountAmount = coupon.discountValue;
      }

      // Ensure discount never exceeds total value costs
      if (discountAmount > calculatedSubtotal) {
        discountAmount = calculatedSubtotal;
      }
    }

    // Subtotal after discount deduction rules are applied
    const totalAfterDiscount = calculatedSubtotal - discountAmount;

    // ==========================================
    // FETCH ADDRESS DETAILS FOR SHIPPING & TAXES
    // ==========================================
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res
        .status(404)
        .json({ success: false, message: "User account profile not found." });
    }

    // Locate the matching address sub-document from the user's saved array
    const selectedShippingAddress = userProfile.addresses.id(addressId);
    if (!selectedShippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid shipping address selection.",
      });
    }

    // ==========================================
    // 44. CALCULATE SHIPPING FEES
    // ==========================================
    let shippingFee = 0;
    // Simple spatial location cost adjustment engine (Can be hooked to external logistics APIs)
    if (
      selectedShippingAddress.state.toUpperCase() === "FCT" ||
      selectedShippingAddress.city.toUpperCase() === "LAGOS"
    ) {
      shippingFee = 5.0; // Regional standard delivery charge
    } else {
      shippingFee = 15.0; // Out-of-region standard shipping charge
    }

    // Free shipping incentive threshold check
    if (totalAfterDiscount > 150) {
      shippingFee = 0;
    }

    // ==========================================
    // 45. CALCULATE TAXES
    // ==========================================
    const taxRatePercent = 0.075; // e.g., 7.5% standard VAT rate rules
    const taxAmount = totalAfterDiscount * taxRatePercent;

    // ==========================================
    // 47. GENERATE FINAL ORDER SUMMARY MANIFEST
    // ==========================================
    const grandTotalCalculation = totalAfterDiscount + shippingFee + taxAmount;

    const orderSummaryManifest = {
      subTotal: Number(calculatedSubtotal.toFixed(2)),
      discountApplied: Number(discountAmount.toFixed(2)),
      shippingCost: Number(shippingFee.toFixed(2)),
      taxCost: Number(taxAmount.toFixed(2)),
      grandTotal: Number(grandTotalCalculation.toFixed(2)),
      shippingAddress: {
        street: selectedShippingAddress.street,
        city: selectedShippingAddress.city,
        state: selectedShippingAddress.state,
        zipCode: selectedShippingAddress.zipCode,
        country: selectedShippingAddress.country,
      },
      items: validatedItemsManifest,
    };

    // ==========================================
    // 41. CREATE CHECKOUT SESSION LOCK
    // ==========================================
    // Save as a pending record inside your orders collection to lock the calculations down
    const checkoutSessionOrder = new Order({
      userId,
      items: orderSummaryManifest.items,

      // Change the keys on the left side to match your Order Schema exactly:
      subtotal: orderSummaryManifest.subTotal,
      discountApplied: orderSummaryManifest.discountApplied,
      taxCost: orderSummaryManifest.taxCost, // ⚡ Updated from tax
      shippingCost: orderSummaryManifest.shippingCost, // ⚡ Updated from shippingFee
      grandTotal: orderSummaryManifest.grandTotal, // ⚡ Updated from total

      shippingAddress: orderSummaryManifest.shippingAddress,
      status: "PendingPayment",
    });
    await checkoutSessionOrder.save();

    // Return the transparent session payload back to the client
    return res.status(200).json({
      success: true,
      message: "Checkout summary session generated successfully.",
      checkoutSessionId: checkoutSessionOrder._id, // Pass this transaction reference code to payment gates
      summary: orderSummaryManifest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { CreateCheckoutSession };
