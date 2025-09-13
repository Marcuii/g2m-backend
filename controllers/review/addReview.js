// Controller to add a review
const Product = require("../../models/Product");
const Review = require("../../models/Review");
const Order = require("../../models/Order");
const User = require("../../models/User");
const createNotification = require("../../utils/createNotification");

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid rating. Rating must be between 1 and 5.",
        },
      });
    }

    const userId = req.user;
    const productId = req.params.productId;

    // 1) Check product exists
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Product not found",
        },
      });

    // 2) Check user purchased & order delivered
    const order = await Order.findOne({
      user: userId,
      "products.product": productId,
      status: "delivered",
    });
    if (!order) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message:
            "You can only review products you have purchased and received.",
        },
      });
    }

    // 3) Prevent duplicate review
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "You have already reviewed this product.",
        },
      });
    }

    // 4) Handle images (max 2)
    let imageUrls = [];
    if (req.files && req.files.images) {
      imageUrls = req.files.images.map((file) => file.path); // Cloudinary auto gives URL
    }

    // 5) Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
      images: imageUrls,
    });

    // 6) Update product stats
    product.reviews.push(review._id);
    product.numReviews = product.reviews.length;

    const reviews = await Review.find({ product: productId });
    product.avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await product.save();

    // 7) Add review to user's reviews
    const user = await User.findById(userId);
    user.reviews.push(review._id);
    await user.save();

    // 8) Create notification for admin
    await createNotification({
      type: "review",
      title: "New Review Submitted",
      message: `${user.name || "Unknown user"} with email ${
        user.email || "unknown email"
      }, phone ${user.phone || "unknown phone"} and id ${
        user._id
      } reviewed product ${product.name}`,
      link: `/products/${product._id}`,
    });

    return res.status(201).json({
      status: 201,
      data: { review, message: "Review added successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: {
        data: null,
        message: err.message,
      },
    });
  }
};

module.exports = addReview;
