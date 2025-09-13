const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      const user = await User.findOne({
        "sessions.refreshToken": refreshToken,
      });

      if (user) {
        user.sessions = user.sessions.filter(
          (s) => s.refreshToken !== refreshToken
        );

        user.sessions = user.sessions.filter((s) => {
          try {
            jwt.verify(s.refreshToken, process.env.JWT_REFRESH_SECRET);
            return true;
          } catch (err) {
            return false;
          }
        });

        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(204).json({
      status: 204,
      data: {
        data: null,
        message: "Logged out successfully",
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

module.exports = logoutUser;
