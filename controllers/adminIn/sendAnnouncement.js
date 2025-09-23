// Controller to send announcement emails to all users who have opted in for updates
const User = require("../../models/User");
const sendEmail = require("../../utils/sendEmail");

const sendAnnouncement = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        status: 400,
        data: { message: "Subject and message are required" },
      });
    }

    // Get all users with getUpdates enabled
    const users = await User.find({ getUpdates: true }).select("email");

    if (!users.length) {
      return res.status(404).json({
        status: 404,
        data: { message: "No users subscribed to updates" },
      });
    }

    // Send emails in bulk
    const emailList = users.map((u) => u.email);
    await sendEmail({
      to: emailList,
      subject,
      html: message, // You can make this more styled
  });

    return res.status(200).json({
      status: 200,
      data: {
        sentTo: emailList.length,
        emails: emailList,
        message: "Announcement emails sent successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { message: err.message },
    });
  }
};

module.exports = sendAnnouncement;
