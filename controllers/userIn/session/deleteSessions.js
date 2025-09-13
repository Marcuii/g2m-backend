// Controller to handle all session deletions for a user
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");

const deleteSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });
    }

    user.sessions = [];

    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      status: 200,
      data: {
        user: { sessions: user.sessions },
        message: "Logged out from all devices successfully",
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

module.exports = deleteSessions;