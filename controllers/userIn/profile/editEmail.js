// Controller to update user email
const User = require("../../../models/User");
const sendEmail = require("../../../utils/sendEmail");
const jwt = require("jsonwebtoken");

const editEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "New email is required" },
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: newEmail }, { pendingEmail: newEmail }],
    });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        data: { data: null, message: "Email already in use" },
      });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "User not found" },
      });
    }

    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // 24:00 today = next day 00:00
    // Difference in milliseconds
    const diffMs = midnight.getTime() - now.getTime() - 60000; // minus 1 minute buffer

    user.pendingEmail = newEmail;
    user.pendingEmailExpires = Date.now() + diffMs; // time until midnight
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_VERIFY_SECRET, {
      expiresIn: Math.floor(diffMs / 1000), // in seconds
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify?email=${user.pendingEmail}&token=${token}`;

    // Send verification email
    await sendEmail({
      to: user.pendingEmail,
      subject: "Verify your new email",
      html: `Click here: ${verifyUrl}
      <p>This link will expire at midnight (in ${Math.round(diffMs / 360000) / 10} hours).</p>`
  });

    return res.status(200).json({
      status: 200,
      data: {
        data: null,
        message:
          "Verification email sent to new address. Please verify to complete the update.",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = editEmail;
