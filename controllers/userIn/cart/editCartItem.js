// Controller to update the quantity of a specific item in the user's cart
const User = require("../../../models/User");
const Product = require("../../../models/Product");

const editCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid product ID or quantity",
        },
      });
    }

    const user = await User.findById(req.user);
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Product not found",
        },
      });
    if (quantity > product.stock)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: `Insufficient stock.`,
        },
      });

    const item = user.cart.find((i) => i.product.toString() === productId);
    if (!item)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Item not in cart",
        },
      });

    item.quantity = quantity;
    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { cart: user.cart },
        message: "Cart updated",
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

module.exports = editCartItem;
