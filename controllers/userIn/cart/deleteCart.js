// Controller to clear all items from the user's cart
const User = require("../../../models/User");

const deleteCart = async (req, res) => {
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

    user.cart = [];
    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { cart: user.cart },
        message: "Cart cleared",
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

module.exports = deleteCart;
