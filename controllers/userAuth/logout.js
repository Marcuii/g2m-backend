const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const logoutUser = async (req, res) => {
  const accessToken = req.cookies?.accessToken;

  try {
    if (accessToken) {
      const decodeUser = jwt.decode(accessToken);
      if (decodeUser?.id) {
        const user = await User.findById(decodeUser.id).select("sessions");
        if (user.sessions) {
          user.sessions = user.sessions.filter(
            (s) => s.accessToken !== accessToken
          );
        }
        await user.save();
      }

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

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
