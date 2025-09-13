const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token");

const refreshAccessToken = async (req, res) => {
  const { expiredToken } = req.body;
  if (!expiredToken) {
    return res.status(404).json({
      status: 404,
      data: { data: null, message: "No expired token" },
    });
  }

  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res.status(404).json({
      status: 404,
      data: { data: null, message: "No refresh token" },
    });
  }

  const decodedExpired = jwt.decode(expiredToken);
  const decodedRefresh = jwt.decode(oldRefreshToken);

  if (
    !decodedExpired ||
    !decodedRefresh ||
    decodedExpired.id !== decodedRefresh.id
  ) {
    return res.status(401).json({
      status: 401,
      data: { data: null, message: "Invalid token" },
    });
  }

  try {
    const user = await User.findOne({
      "sessions.refreshToken": oldRefreshToken,
    });
    if (!user) {
      return res.status(401).json({
        status: 401,
        data: { data: null, message: "Invalid refresh token" },
      });
    }

    const session = user.sessions.find(
      (s) => s.refreshToken === oldRefreshToken
    );
    if (!session) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Session not found" },
      });
    }

    jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            status: 401,
            data: { data: null, message: "Expired refresh token" },
          });
        }

        const newAccessToken = generateAccessToken(decoded.id, user.role);
        const newRefreshToken = generateRefreshToken(decoded.id);

        session.refreshToken = newRefreshToken;
        session.lastUsed = new Date();
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        return res.status(200).json({
          status: 200,
          data: {
            token: newAccessToken,
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
