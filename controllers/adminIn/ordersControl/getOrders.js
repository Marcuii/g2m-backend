// controllers/admin/order/getOrders.js
const Order = require("../../../models/Order");

const getOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      minTotal,
      maxTotal,
      userEmail,
      userName,
      orderNumber,
      search,
      sortBy = "createdAt", // default
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Status filter
    if (status) filter.status = status;

    // Payment status/method filter
    if (paymentStatus) filter["paymentInfo.status"] = paymentStatus;
    if (paymentMethod) filter["paymentInfo.method"] = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Total amount range filter
    if (minTotal || maxTotal) {
      filter.totalAmount = {};
      if (minTotal) filter.totalAmount.$gte = Number(minTotal);
      if (maxTotal) filter.totalAmount.$lte = Number(maxTotal);
    }

    // Order number filter
    if (orderNumber)
      filter.orderNumber = { $regex: orderNumber, $options: "i" };

    // Search filter (orderNumber, product name/sku)
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "products.name": { $regex: search, $options: "i" } },
        { "products.sku": { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    const allowedSort = new Set([
      "createdAt",
      "totalAmount",
      "status",
      "paymentInfo.status",
    ]);
    const sortField = allowedSort.has(sortBy) ? sortBy : "createdAt";
    const sortOptions = { [sortField]: order === "asc" ? 1 : -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const query = Order.find(filter)
      .populate("user", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Additional user filters (need populate first)
    if (userEmail || userName) {
      query.populate({
        path: "user",
        match: {
          ...(userEmail ? { email: { $regex: userEmail, $options: "i" } } : {}),
          ...(userName ? { name: { $regex: userName, $options: "i" } } : {}),
        },
        select: "name email",
      });
    }

    const orders = await query.exec();
    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      status: 200,
      data: {
        orders,
        message: "Orders retrieved successfully",
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          sortBy,
          order,
        },
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

module.exports = getOrders;
