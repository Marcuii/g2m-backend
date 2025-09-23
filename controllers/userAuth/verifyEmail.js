// Controller for verifying a user's email using a token
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const sendEmail = require("../../utils/sendEmail");

const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.params;
    if (!email || !token) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Email and token are required" },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_VERIFY_SECRET);
    if (!decoded) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Invalid confirmation link" },
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Account expired, please register again" },
      });
    }

    if (!user.isVerified && user.email === email) {
      user.isVerified = true;

      await user.save();
      await sendEmail({
        to: email,
        subject: "Your G2M Account has been Verified",
        html: `<h2>Congratulations!</h2>
        <p>Your email has been successfully verified. You can now log in to your account.</p>`,
      });
    } else if (user.pendingEmail && user.pendingEmail === email) {
      if (user.pendingEmailExpires > Date.now()) {
        user.email = user.pendingEmail;
        user.pendingEmail = null;
        user.pendingEmailExpires = null;

        await user.save();
        await sendEmail({
          to: email,
          subject: "Your G2M Account has been Verified",
          html: `<h2>Congratulations!</h2>
          <p>Your new email has been successfully verified and updated in our system.</p>`,
        });
      } else {
        user.pendingEmail = null;
        user.pendingEmailExpires = null;
        await user.save();
        throw new Error("Verification link expired. Please request again.");
      }
    } else {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Invalid verification request" },
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        user: { email: user.email },
        message: "Email verified successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = verifyEmail;
