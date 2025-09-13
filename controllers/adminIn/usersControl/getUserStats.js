// controllers/admin/getUserStats.js
const User = require("../../../models/User");

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const admins = await User.countDocuments({ role: "admin" });
    const customers = await User.countDocuments({ role: "customer" });

    return res.status(200).json({
      status: 200,
      data: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        admins,
        customers,
        message: "User stats retrieved successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getUserStats;
