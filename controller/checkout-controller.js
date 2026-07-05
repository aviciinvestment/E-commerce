// Import the detached service layer file
const checkoutService = require("../services/checkout-servicees");

const CreateCheckoutSession = async (req, res) => {
  try {
    const { userId, addressId, couponCode } = req.body;

    // Trigger the service pipeline logic matrix
    const checkoutResult = await checkoutService.executeCheckoutPipeline(
      userId,
      addressId,
      couponCode,
    );

    // Return the response smoothly
    return res.status(200).json({
      success: true,
      message: "Checkout summary session generated successfully.",
      checkoutSessionId: checkoutResult.checkoutSessionId,
      summary: checkoutResult.summary,
    });
  } catch (error) {
    // If anything fails inside the service layer, it lands here automatically
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { CreateCheckoutSession };
