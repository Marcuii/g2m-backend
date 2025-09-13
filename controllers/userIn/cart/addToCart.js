// Controller to add items to the user's cart
const User = require("../../../models/User");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
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

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { cart: user.cart },
        message: "Product added to cart",
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

module.exports = addToCart;
