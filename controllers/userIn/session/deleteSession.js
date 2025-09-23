// Controller to handle session deletion for a user
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Session ID is required",
        },
      });
    }

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

    const session = user.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Session not found",
        },
      });
    }

    if (session.accessToken === req.cookies.accessToken) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Cannot delete the current session (use logout instead)",
        },
      });
    }

    session.deleteOne();

    user.sessions = user.sessions.filter((s) => {
      try {
        jwt.verify(s.refreshToken, process.env.JWT_REFRESH_SECRET);
        return true;
      } catch (err) {
        return false;
      }
    });

    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { sessions: user.sessions },
        message: "Session logged out successfully",
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

module.exports = deleteSession;