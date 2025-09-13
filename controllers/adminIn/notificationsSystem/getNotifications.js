// Controller to get notifications for admin users
const Notification = require("../../../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const { unread, type, page = 1, limit = 10 } = req.query;
    const query = { recipientRole: "admin" };

    if (unread === "true") query.read = false;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);

    return res.status(200).json({
      status: 200,
      data: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        notifications,
        message: "Notifications retrieved successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getNotifications;
