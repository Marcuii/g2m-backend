// Controller to cancel order
const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Voucher = require("../../models/Voucher");
const sendEmail = require("../../utils/sendEmail");

const cancelOrder = async (req, res) => {
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

    const order = await Order.findOne({ orderNumber });
    if (!order)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Order not found",
        },
      });

    // Ensure only owner or admin can cancel
    if (
      req.user.role !== "admin" &&
      order.user.toString() !== req.user.toString()
    ) {
      return res.status(403).json({
        status: 403,
        data: {
          data: null,
          message: "Not authorized",
        },
      });
    }

    // Only pending orders can be canceled
    if (order.status !== "pending") {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Order cannot be cancelled after processing",
        },
      });
    }

    // Cancel the order
    order.status = "cancelled";
    order.canceledAt = Date.now();
    order.lastUpdatedBy = req.user;
    await order.save();

    // Restore product stock
    for (let item of order.products) {
      const product = await Product.findById(item.product);
      product.stock += item.quantity;
      product.sold = (product.sold || 0) - item.quantity;
      await product.save();
    }

    // Decrement voucher usage if applicable
    if (order.usedVoucher) {
      const voucher = await Voucher.findOne({ code: order.usedVoucher });
      if (voucher) {
        voucher.timesUsed -= 1;
        await voucher.save();
      }
    }

    // Notify user via email
    try {
      const user = await User.findById(order.user);
      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: "Order Cancellation",
          html: `
            <h2>Your order has been canceled</h2>
            <p>Hi ${user.name || "Customer"},</p>
            <p>Your order <b>#${
              order.orderNumber
            }</b> has been canceled successfully.</p>
            <p>If you have any questions, feel free to contact us.</p>
          `,
        });
      }
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
    }

    return res.status(200).json({
      status: 200,
      data: {
        order,
        message: "Order canceled successfully",
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

module.exports = cancelOrder;
