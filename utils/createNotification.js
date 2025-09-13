// Utility to create notifications
const Notification = require("../models/Notification");

const createNotification = async ({ type, title, message, link, priority = "normal", recipientRole = "admin" }) => {
  try {
    const notification = new Notification({
      type,
      title,
      message,
      link,
      priority,
      recipientRole,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

module.exports = createNotification;
