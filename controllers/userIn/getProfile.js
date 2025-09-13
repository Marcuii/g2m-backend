// Controller to get the authenticated user's data
const User = require("../../models/User");
const Order = require("../../models/Order");
const Review = require("../../models/Review");

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select("-password -_id -isVerified -__v")
      .populate({
        path: "orders",
        select: "orderNumber products totalAmount status createdAt",
      })
      .populate({
        path: "reviews",
        select: "product rating comment images createdAt",
        populate: { path: "product", select: "name mainImage" },
      });
    return res.status(200).json({
      status: 200,
      data: {
        user: {
          email: user.email,
          getUpdates: user.getUpdates,
          name: user.name,
          phone: user.phone,
          birthdate: user.birthdate,
          image: user.image,
          isFirstLogin: user.isFirstLogin,
          sessions: user.sessions,
          orderCount: user.orderCount,
          orders: user.orders,
          reviews: user.reviews,
          cart: user.cart,
          wishlist: user.wishlist,
          addresses: user.addresses,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: "User data retrieved successfully",
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      data: {
        data: null,
        message: err.message,
      },
    });
  }
};

module.exports = getMe;
