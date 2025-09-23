// Controller to get user orders
const Order = require("../../models/Order");

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ user: userId })
      .select("-_id -createdBy -lastUpdatedBy -updatedAt -__v")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      data: {
        ordersCount: orders.length,
        orders,
        message: "User orders retrieved successfully",
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

module.exports = getUserOrders;
