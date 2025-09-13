// Controller to update user password
const User = require("../../../models/User");
const bcrypt = require("bcrypt");

const editPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Both current and new password are required",
        },
      });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "User not found" },
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Current password is incorrect" },
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      status: 200,
      data: { data: null, message: "Password updated successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = editPassword;
