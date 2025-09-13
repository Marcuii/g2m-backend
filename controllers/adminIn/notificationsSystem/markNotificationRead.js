// Controller to mark a notification as read
const Notification = require("../../../models/Notification");

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }, // Expires in 90 days
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Notification not found" },
      });
    }
    return res.status(200).json({
      status: 200,
      data: { notification, message: "Notification marked as read" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = markNotificationRead;
