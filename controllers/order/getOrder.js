// Controller to get order
const Order = require("../../models/Order");

const getOrder = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Order Number is required",
        },
      });
    }

    const order = await Order.findOne({ orderNumber }).populate(
      "user",
      "name email"
    );

    if (!order)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Order not found",
        },
      });

    // Ensure only owner or admin can view
    if (req.userRole !== "admin" && order.user !== req.user) {
      return res.status(403).json({
        status: 403,
        data: {
          data: null,
          message: "Not authorized",
        },
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        order,
        message: "Order retrieved successfully",
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

module.exports = getOrder;
