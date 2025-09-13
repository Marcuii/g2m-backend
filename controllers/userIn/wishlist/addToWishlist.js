// Controller to add a product to the user's wishlist
const User = require("../../../models/User");

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Product ID is required",
        },
      });

    const user = await User.findById(req.user);
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }

    await user.save();
    return res.status(200).json({
      status: 200,
      data: {
        user: { wishlist: user.wishlist },
        message: "Wishlist updated",
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

module.exports = addToWishlist;
