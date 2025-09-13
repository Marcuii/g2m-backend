// Controller to clear the user's wishlist
const User = require("../../../models/User");

const deleteWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });

    user.wishlist = [];
    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { wishlist: user.wishlist },
        message: "Wishlist cleared",
      },
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

module.exports = deleteWishlist;
