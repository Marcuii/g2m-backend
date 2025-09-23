// Controller for adding a ticket
const User = require("../../models/User");
const sendEmail = require("../../utils/sendEmail");

const addTicket = async (req, res) => {
  try {
    const userId = req.user;
    const { subject, type, message } = req.body;

    if (!subject || !type || !message) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Subject, type, and message are required",
        },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "User not found" },
      });
    }

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `New Support Ticket: ${subject}`,
      html: `<p>Type: ${type}</p>
             <p>Message: ${message}</p>
             <br/>
             <p>User ID: ${userId}</p>
             <p>User Email: ${user.email}</p>
             <p>User Name: ${user.name}</p>
             <p>User Phone: ${user.phone || "N/A"}</p>
             <p>Submitted At: ${new Date().toISOString()}</p>`,
    });

    return res.status(201).json({
      status: 201,
      data: { data: null, message: "Ticket created successfully" },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: "Internal server error" },
    });
  }
};

module.exports = addTicket;
