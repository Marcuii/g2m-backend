// Controller to get a single user by ID, excluding sensitive fields and populating related data
const User = require("../../../models/User");
const Review = require("../../../models/Review");
const Order = require("../../../models/Order");

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("orders")
      .populate({
        path: "reviews",
        select: "product rating comment images createdAt",
        populate: { path: "product", select: "sku name mainImage" },
      })
      .populate("orders", "orderNumber totalAmount status createdAt")
      .populate("wishlist cart", "sku name mainImage");

    if (!user) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "User not found" },
      });
    }

    return res.status(200).json({
      status: 200,
      data: { user, message: "User retrieved successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getUser;
