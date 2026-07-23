const reviewService = require("../services/review-service");
const Review = require("../model/review-schema");

// 65. CREATE NEW REVIEW
const CreateProductReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    const review = await reviewService.writeNewProductReview(
      userId,
      productId,
      rating,
      comment,
    );
    return res.status(201).json({
      success: true,
      message: "Review posted successfully!",
      data: review,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 66. UPDATE SPECIFIC REVIEW
const UpdateProductReview = async (req, res) => {
  try {
    const { reviewId, userId, rating, comment } = req.body;
    const updatedReview = await reviewService.modifyUserReview(
      reviewId,
      userId,
      rating,
      comment,
    );
    return res.status(200).json({
      success: true,
      message: "Review updated cleanly.",
      data: updatedReview,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 67. REMOVE TARGET REVIEW
const DeleteProductReview = async (req, res) => {
  try {
    const { reviewId, userId } = req.body;
    await reviewService.dropUserReview(reviewId, userId);
    return res
      .status(200)
      .json({ success: true, message: "Review removed safely." });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// 68. FETCH ALL REVIEWS FOR A SINGLE PRODUCT
const GetProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate("userId", "fullname")
      .sort("-createdAt");
    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  CreateProductReview,
  UpdateProductReview,
  DeleteProductReview,
  GetProductReviews,
};
