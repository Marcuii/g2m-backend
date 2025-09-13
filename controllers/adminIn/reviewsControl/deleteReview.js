// Controller to delete a review and update related product stats
const Review = require("../../../models/Review");
const Product = require("../../../models/Product");

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // 1) Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Review not found" },
      });
    }

    // 2) Get product related to review
    const product = await Product.findById(review.product);
    if (!product) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Related product not found" },
      });
    }

    // 3) Remove review reference from product
    product.reviews = product.reviews.filter(
      (id) => id.toString() !== reviewId
    );

    // 4) Recalculate stats
    const remainingReviews = await Review.find({
      product: product._id,
      _id: { $ne: reviewId },
    });
    product.numReviews = remainingReviews.length;
    product.avgRating =
      remainingReviews.length > 0
        ? remainingReviews.reduce((acc, r) => acc + r.rating, 0) /
          remainingReviews.length
        : 0;

    await product.save();

    // 5) Delete the review
    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      status: 200,
      data: {
        data: null,
        message: "Review deleted successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = deleteReview;
