// controllers/order/addOrder.js
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Voucher = require("../../models/Voucher");
const User = require("../../models/User");
const sendEmail = require("../../utils/sendEmail");
const createNotification = require("../../utils/createNotification");

const addOrder = async (req, res) => {
  try {
    const {
      products,
      tax,
      shippingCost,
      usedVoucher,
      shippingAddress,
      billingAddress,
      paymentInfo,
      notes,
    } = req.body;
    let userId = req.user;

    // --- validation
    if (!products || products.length === 0) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Products are required" },
      });
    }
    if (
      !shippingAddress ||
      !billingAddress ||
      !paymentInfo ||
      tax == null ||
      shippingCost == null
    ) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "All fields are required" },
      });
    }

    // --- if admin creates order for another user
    if (req.body.user) {
      if (req.userRole !== "admin") {
        return res.status(403).json({
          status: 403,
          data: { data: null, message: "Forbidden" },
        });
      }
      const userFromBody = await User.findById(req.body.user);
      if (!userFromBody) {
        return res.status(404).json({
          status: 404,
          data: { data: null, message: "User not found" },
        });
      }
      userId = userFromBody._id;
    }

    // --- validate products and calculate subtotal
    let subTotal = 0;
    const orderProducts = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          status: 404,
          data: { data: null, message: `Product not found: ${item.product}` },
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 400,
          data: {
            data: null,
            message: `Insufficient stock for: ${item.product}`,
          },
        });
      }

      const priceAtPurchase = product.price;
      subTotal += priceAtPurchase * item.quantity;

      orderProducts.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        mainImage: product.mainImage,
        quantity: item.quantity,
        priceAtPurchase,
      });
    }

    // --- handle voucher
    let discountAmount = 0;
    let appliedVoucher = null;

    if (usedVoucher) {
      const voucher = await Voucher.findOne({ code: usedVoucher });
      if (!voucher) {
        return res.status(404).json({
          status: 404,
          data: { data: null, message: "Voucher not found" },
        });
      }

      // validate
      if (!voucher.isActive || voucher.expiryDate < Date.now()) {
        return res.status(400).json({
          status: 400,
          data: { data: null, message: "Voucher expired or inactive" },
        });
      }
      if (voucher.usageLimit && voucher.timesUsed >= voucher.usageLimit) {
        return res.status(400).json({
          status: 400,
          data: { data: null, message: "Voucher usage limit reached" },
        });
      }
      if (voucher.minPurchase && subTotal < voucher.minPurchase) {
        return res.status(400).json({
          status: 400,
          data: { data: null, message: "Minimum purchase not met" },
        });
      }

      // calculate discount
      if (voucher.type === "fixed") {
        discountAmount = voucher.discount;
      } else if (voucher.type === "percentage") {
        discountAmount = (subTotal * voucher.discount) / 100;
      }

      appliedVoucher = voucher;
    }

    // --- final totals
    const totalAmount = subTotal + tax + shippingCost - discountAmount;

    const newOrder = new Order({
      user: userId,
      products: orderProducts,
      subTotal,
      tax,
      shippingCost,
      discountAmount,
      usedVoucher: appliedVoucher ? appliedVoucher.code : null,
      totalAmount,
      shippingAddress,
      billingAddress,
      notes,
      paymentInfo,
      createdBy: req.user,
    });

    await newOrder.save();

    // --- update product stocks
    for (let item of products) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();

      // --- create stock notification if low
      if (product.stock <= 5) {
        await createNotification({
          type: "stock",
          title: "Low Stock Alert",
          message: `${product.name} with SKU ${product.sku} is running low (stock: ${product.stock})`,
          link: `/products/${product.sku}`,
          priority: "high",
        });
      } else if (product.stock === 0) {
        await createNotification({
          type: "stock",
          title: "Out of Stock",
          message: `${product.name} with SKU ${product.sku} is out of stock`,
          link: `/products/${product.sku}`,
          priority: "high",
        });
      }
    }

    // --- increment voucher usage (after order success)
    if (appliedVoucher) {
      appliedVoucher.timesUsed += 1;
      await appliedVoucher.save();

      // --- create voucher usage notification
      if (appliedVoucher.timesUsed === appliedVoucher.usageLimit) {
        await createNotification({
          type: "voucher",
          title: "Voucher Usage Limit Reached",
          message: `Voucher ${appliedVoucher.code} has reached its usage limit and is now inactive.`,
          link: `/vouchers/${appliedVoucher._id}`,
          priority: "normal",
        });
      }
    }

    // --- update user order history
    const user = await User.findById(userId);
    user.orderCount = (user.orderCount || 0) + 1;
    user.orders.push(newOrder.orderNumber);

    // --- send confirmation email
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: "Order Confirmation",
        html: `
        <h2>Thank you for your order!</h2>
        <p>Hi ${user.name || "Customer"},</p>
        <p>Your order <b>#${
          newOrder.orderNumber
        }</b> has been placed successfully.</p>
        <p>Total: <b>$${totalAmount.toFixed(2)}</b></p>
        <p>We’ll notify you once it’s shipped 🚚</p>
        `,
      });
    }

    await user.save();

    // --- create admin notification
    await createNotification({
      type: "order",
      title: "New Order Placed",
      message: `Order #${newOrder.orderNumber} was placed by ${
        user.name || "a customer"
      } with email ${user.email || "unknown email"}, phone ${
        user.phone || "unknown phone"
      } and id ${user._id}.`,
      link: `/orders/${newOrder.orderNumber}`,
      priority: "normal",
    });

    return res.status(201).json({
      status: 201,
      data: { order: newOrder, message: "Order created successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = addOrder;
