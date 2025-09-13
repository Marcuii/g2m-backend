// Controller for registering a new user, hashing their password, and sending a verification email
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/sendEmail");

const register = async (req, res) => {
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

    const existingUser = await User.findOne({
      $or: [{ email: email }, { pendingEmail: email }],
    });
    if (existingUser)
      return res.status(400).json({
        status: 409,
        data: {
          data: null,
          message: "Email already in use",
        },
      });

    const getUpdates = req.body.getUpdates ? req.body.getUpdates : false;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      getUpdates,
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_VERIFY_SECRET,
      { expiresIn: "1h" }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify?email=${newUser.email}&token=${token}`;

    await sendEmail(
      email,
      "Confirm your G2M Account",
      `<h2>Welcome to G2M!</h2>
      <p>Please confirm your email to activate your account.</p>
      <p><a href="${verifyUrl}">Click here to verify</a></p>
      <br/>
      <p>This link will expire in 1 hour.</p>
      <p><strong>Note:</strong> If you don’t verify your email within 30 days, your account will be automatically deleted.</p>`
    );

    return res.status(201).json({
      status: 201,
      data: {
        data: null,
        message:
          "Registration successful. Please check your email to verify your account.",
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

module.exports = register;
