// Utility to send emails using nodemailer
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const recipients = Array.isArray(to) ? to.join(",") : to;

    await transporter.sendMail({
      from: `"G2M Store" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject,
      html
    });
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = sendEmail;