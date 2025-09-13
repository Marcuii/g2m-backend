// Controller to handle user login
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Email and password are required",
        },
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid email or password",
        },
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid email or password",
        },
      });

    if (!user.isVerified) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_VERIFY_SECRET, {
        expiresIn: "1h",
      });

      const verifyUrl = `${process.env.CLIENT_URL}/verify?email=${email}&token=${token}`;

      await sendEmail(
        email,
        "Resend: Confirm your G2M Account",
        `<h2>Welcome to G2M!</h2>
            <p>Please confirm your email by clicking the link below:</p>
            <a href="${verifyUrl}">${verifyUrl}</a>
            <p>This link will expire in 1 hour.</p>`
      );

      return res.status(403).json({
        status: 403,
        data: {
          data: null,
          message:
            "Email not verified. Please check your inbox for the new verification link.",
        },
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const device = req.headers["user-agent"] || "Unknown device";
    const ip = req.ip || req.connection.remoteAddress;

    user.sessions.push({
      refreshToken,
      device,
      ip,
      createdAt: new Date(),
      lastUsed: new Date(),
    });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      status: 200,
      data: {
        token: accessToken,
        message: "Login successful",
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

module.exports = login;
