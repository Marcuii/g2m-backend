// Controller to get all reviews with filtering, pagination, and sorting
const Review = require("../../../models/Review");

const getReviews = async (req, res) => {
  try {
    const {
      user, // filter by userId
      product, // filter by productId
      minRating,
      maxRating,
      search, // search inside comments
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (user) query.user = user;
    if (product) query.product = product;
    if (minRating) query.rating = { ...query.rating, $gte: Number(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: Number(maxRating) };

    if (search) query.comment = { $regex: search, $options: "i" };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(query)
      .populate("user", "name image email")
      .populate("product", "name sku mainImage")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    return res.status(200).json({
      status: 200,
      data: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        reviews,
        message: "Reviews retrieved successfully",
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
