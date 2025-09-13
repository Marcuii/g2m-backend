// Controller to get all reviews by the logged-in user
const Review = require("../../models/Review");

const getReviews = async (req, res) => {
  try {
    const userId = req.user;

    const reviews = await Review.find({ user: userId })
      .populate("product", "name mainImage sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      data: {
        count: reviews.length,
        reviews,
        message: "User reviews retrieved successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getReviews;
