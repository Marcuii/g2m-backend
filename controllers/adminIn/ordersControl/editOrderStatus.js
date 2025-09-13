// Controller to update order status (for admin)
const Order = require("../../../models/Order");
const User = require("../../../models/User");
const sendEmail = require("../../../utils/sendEmail");

const editOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderNumber = req.params.orderNumber;
    if (!status || !orderNumber) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Status and Order Number are required",
        },
      });
    } else if (
      ![
        "pending",
        "packaged",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ].includes(status)
    ) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid status value",
        },
      });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Order not found",
        },
      });

    if (
      order.status === "delivered" ||
      order.status === "cancelled" ||
      order.status === "refunded"
    ) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message:
            "Order cannot be updated after delivery, cancellation, or refund",
        },
      });
    } else if (order.status === status) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Order status is already " + status,
        },
      });
    }

    order.status = status;
    order.lastUpdatedBy = req.user;

    if (status === "shipped") order.shippedAt = Date.now();
    if (status === "delivered") order.deliveredAt = Date.now();
    if (status === "cancelled") order.canceledAt = Date.now();

    await order.save();

    // Notify user via email about status change
    const user = await User.findById(order.user);
    if (user && user.email) {
      if (status === "delivered") {
        await sendEmail({
          to: user.email,
          subject: `Your order ${order.orderNumber} has been delivered`,
          html: `
            <h2>Your order has been delivered</h2>
            <p>Hi ${user.name || "Customer"},</p>
            <p>Your order <b>#${order.orderNumber}</b> has been delivered.</p>
            <p>If you have any questions, feel free to contact us.</p>
          `,
        });
      } else {
        await sendEmail({
          to: user.email,
          subject: `Your order ${order.orderNumber} is now ${status}`,
          html: `<h2>Your order status has been updated</h2>
        <p>Hi ${user.name || "Customer"},</p>
        <p>Your order <b>#${order.orderNumber}</b> is now <b>${status}</b>.</p>
        <p>If you have any questions, feel free to contact us.</p>`,
        });
      }
    }

    return res.json({
      status: 200,
      data: {
        order,
        message: "Order status updated",
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

module.exports = editOrderStatus;
