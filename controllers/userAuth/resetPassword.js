// Controller for resetting a user's password using a token
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");

const resetPassword = async (req, res) => {
  try {
    const { token, email } = req.params;
    const { newPassword } = req.body;

    if (!token || !email || !newPassword)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Token, email, and new password are required",
        },
      });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // still valid
    });

    if (!user)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid or expired credentials",
        },
      });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await sendEmail(
      email,
      "Your G2M Account's Password Has Been Reset",
      `<p>Your password has been successfully reset. You can now log in to your account.</p>`
    );

    return res.status(200).json({
      status: 200,
      data: {
        data: null,
        message: "Password has been reset successfully",
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

module.exports = resetPassword;
