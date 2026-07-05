const Cart = require("../model/cart-schema");
const Product = require("../model/Products-schema");
const User = require("../model/Users-schema");
const Coupon = require("../model/coupon-schema");
const Order = require("../model/order-schema");

const executeCheckoutPipeline = async (userId, addressId, couponCode) => {
  // ==========================================
  // 42. VALIDATE CART & INTEGRITY CHECK
  // ==========================================
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    throw new Error("Checkout failed. Your shopping cart is empty.");
  }

  // ==========================================
  // 43. VALIDATE STOCK & RE-VERIFY LIVE PRICES
  // ==========================================
  let calculatedSubtotal = 0;
  const validatedItemsManifest = [];

  for (const item of cart.items) {
    const liveProductDetails = item.productId;

    if (!liveProductDetails || !liveProductDetails.isActive) {
      throw new Error(
        `Item '${liveProductDetails?.name || "Unknown"}' is no longer available.`,
      );
    }

    if (liveProductDetails.stockCount < item.quantity) {
      throw new Error(
        `Insufficient inventory for '${liveProductDetails.name}'. Only ${liveProductDetails.stockCount} left in stock.`,
      );
    }

    const exactLineTotal = liveProductDetails.price * item.quantity;
    calculatedSubtotal += exactLineTotal;

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
      throw new Error("Promo coupon code is invalid or expired.");
    }

    if (calculatedSubtotal < coupon.minOrderAmount) {
      throw new Error(
        `Coupon requires a minimum order amount of $${coupon.minOrderAmount}.`,
      );
    }

    if (coupon.discountType === "percentage") {
      discountAmount = calculatedSubtotal * (coupon.discountValue / 100);
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > calculatedSubtotal) {
      discountAmount = calculatedSubtotal;
    }
  }

  const totalAfterDiscount = calculatedSubtotal - discountAmount;

  // ==========================================
  // FETCH ADDRESS DETAILS FOR SHIPPING & TAXES
  // ==========================================
  const userProfile = await User.findById(userId);
  if (!userProfile) {
    throw new Error("User account profile not found.");
  }

  const selectedShippingAddress = userProfile.addresses.id(addressId);
  if (!selectedShippingAddress) {
    throw new Error("Please specify a valid shipping address selection.");
  }

  // ==========================================
  // 44. CALCULATE SHIPPING FEES
  // ==========================================
  let shippingFee = 0;
  if (
    selectedShippingAddress.state.toUpperCase() === "FCT" ||
    selectedShippingAddress.city.toUpperCase() === "LAGOS"
  ) {
    shippingFee = 5.0;
  } else {
    shippingFee = 15.0;
  }

  if (totalAfterDiscount > 150) {
    shippingFee = 0;
  }

  // ==========================================
  // 45. CALCULATE TAXES
  // ==========================================
  const taxRatePercent = 0.075;
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
  const checkoutSessionOrder = new Order({
    userId,
    items: orderSummaryManifest.items,
    subtotal: orderSummaryManifest.subTotal,
    discountApplied: orderSummaryManifest.discountApplied,
    taxCost: orderSummaryManifest.taxCost,
    shippingCost: orderSummaryManifest.shippingCost,
    grandTotal: orderSummaryManifest.grandTotal,
    shippingAddress: orderSummaryManifest.shippingAddress,
    status: "PendingPayment",
  });

  await checkoutSessionOrder.save();

  // Return the completed bundle back to the controller
  return {
    checkoutSessionId: checkoutSessionOrder._id,
    summary: orderSummaryManifest,
  };
};

module.exports = { executeCheckoutPipeline };
