// Controller to remove an item from the user's cart
const User = require("../../../models/User");

const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
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

    user.cart = user.cart.filter((i) => i.product.toString() !== productId);
    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { cart: user.cart },
        message: "Item removed",
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

module.exports = deleteCartItem;
