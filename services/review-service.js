const Review = require("../model/review-schema");
const Order = require("../model/order-schema");
const Product = require("../model/Products-schema");

class ReviewService {
  // ==========================================
  // 65 & 69. WRITE REVIEW & VERIFY PURCHASE
  // ==========================================
  async writeNewProductReview(userId, productId, rating, comment) {
    // 69. Run Verified Purchase matching verification logic
    const verifiedOrderCheck = await Order.findOne({
      userId,
      status: { $in: ["Paid", "Shipped", "Delivered"] },
      "items.productId": productId,
    });

    const isVerified = !!verifiedOrderCheck; // Converts evaluation directly to boolean true/false

    const newReview = new Review({
      userId,
      productId,
      rating,
      comment,
      isVerifiedPurchase: isVerified,
    });

    await newReview.save();

    // Automatically trigger calculation update loop for the product averages
    await this.calculateAverageProductRatings(productId);

    return newReview;
  }

  // ==========================================
  // 66. UPDATE EXSTING REVIEW WITH AUTHOR GUARD
  // ==========================================
  async modifyUserReview(reviewId, userId, rating, comment) {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review)
      throw new Error("Review not found or unauthorized edit action blocked.");

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await this.calculateAverageProductRatings(review.productId);
    return review;
  }

  // ==========================================
  // 67. DELETE USER REVIEW WITH AUTHOR GUARD
  // ==========================================
  async dropUserReview(reviewId, userId) {
    const review = await Review.findOneAndDelete({ _id: reviewId, userId });
    if (!review)
      throw new Error(
        "Review allocation missing or unauthorized action blocked.",
      );

    await this.calculateAverageProductRatings(review.productId);
    return true;
  }

  // ==========================================
  // 68. CALCULATE RUNTIME AGGREGATE SCORES
  // ==========================================
  async calculateAverageProductRatings(productId) {
    const calculations = await Review.aggregate([
      { $match: { productId: productId } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviewsCount: { $sum: 1 },
        },
      },
    ]);

    // If reviews exist, update the product document metrics. If not, reset defaults.
    if (calculations.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Number(calculations[0].averageRating.toFixed(1)),
        reviewCount: calculations[0].totalReviewsCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  }
}

module.exports = new ReviewService();
