// Controller to get the checkout details for the authenticated user
const User = require("../../../models/User");
const Product = require("../../../models/Product");

const getCheckout = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate({
      path: "cart.product",
      select: "name mainImage price",
    });
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });
    if (user.cart.length === 0)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Cart is empty",
        },
      });
    let subtotal = 0;
    for (const item of user.cart) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          status: 400,
          data: {
            data: null,
            message: `Product ${item.product.name} is out of stock or insufficient quantity`,
          },
        });
      }
      subtotal += product.price * item.quantity;
    }
    return res.status(200).json({
      status: 200,
      data: {
        user: { cart: user.cart },
        message: "Checkout details retrieved successfully",
        subtotal,
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

module.exports = getCheckout;
