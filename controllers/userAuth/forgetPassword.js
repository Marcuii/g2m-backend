// Controller to handle password reset requests
const crypto = require("crypto");
const User = require("../../models/User");
const sendEmail = require("../../utils/sendEmail");

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Email is required",
        },
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your G2M password",
      html: `<h2>Password Reset</h2>
       <p>Click the link below to reset your password:</p>
       <a href="${resetUrl}">${resetUrl}</a>
       <p>This link will expire in 15 minutes.</p>`
    });

    return res.status(200).json({
      status: 200,
      data: {
        data: null,
        message: "Password reset email sent",
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

module.exports = requestPasswordReset;
