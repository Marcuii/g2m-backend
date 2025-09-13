// controllers/notifications/markAllRead.js
const Notification = require("../../../models/Notification");

const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientRole: "admin", read: false },
      { read: true, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } // Expires in 90 days 
    );
    return res.status(200).json({
      status: 200,
      data: { message: "All notifications marked as read" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = markNotificationsRead;
