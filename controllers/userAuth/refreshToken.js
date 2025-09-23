const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token");

const refreshAccessToken = async (req, res) => {
  const expiredToken = req.cookies.accessToken;
  if (!expiredToken) {
    return res.status(404).json({
      status: 404,
      data: { data: null, message: "No expired token" },
    });
  }

  try {
    const decodedExpired = jwt.decode(expiredToken);
    const userId = decodedExpired?.id;

    if (!decodedExpired || !userId) {
      return res.status(401).json({
        status: 401,
        data: { data: null, message: "Invalid token" },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        status: 401,
        data: { data: null, message: "Invalid user" },
      });
    }

    const sessions = user.sessions;
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "No active sessions found" },
      });
    }

    const currentSessionIndex = sessions.findIndex(
      (s) => s.accessToken === expiredToken
    );

    if (currentSessionIndex === -1) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Session not found" },
      });
    }

    const oldRefreshToken = sessions[currentSessionIndex].refreshToken;
    const decodedRefresh = jwt.decode(oldRefreshToken);

    if (!decodedRefresh || decodedExpired.id !== decodedRefresh.id) {
      return res.status(401).json({
        status: 401,
        data: { data: null, message: "Invalid token" },
      });
    }

    jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          sessions.splice(currentSessionIndex, 1);
          user.sessions = sessions;
          await user.save();
          return res.status(401).json({
            status: 401,
            data: { data: null, message: "Expired refresh token" },
          });
        }

        const newAccessToken = generateAccessToken(decoded.id, user.role);
        const newRefreshToken = generateRefreshToken(decoded.id);

        sessions[currentSessionIndex].accessToken = newAccessToken;
        sessions[currentSessionIndex].refreshToken = newRefreshToken;
        sessions[currentSessionIndex].lastUsed = new Date();
        user.sessions = sessions;
        await user.save();

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        });

        return res.status(200).json({
          status: 200,
          data: {
            data: null,
            message: "Access token refreshed successfully",
          },
        });
      }
    );
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

module.exports = refreshAccessToken;
