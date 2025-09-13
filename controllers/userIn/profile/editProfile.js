// Controller to set up or update user's profile information
const User = require("../../../models/User");

const editProfile = async (req, res) => {
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

    // used to keep the old image or delete by passing empty string
    if (req.body.image === undefined) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Image is required",
        },
      });
    }
    user.image = req.body.image;

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.birthdate) user.birthdate = new Date(req.body.birthdate);
    if (req.file?.path) user.image = req.file.path;
    if (req.body.getUpdates) user.getUpdates = req.body.getUpdates;
    if (typeof req.body.isFirstLogin !== "undefined")
      user.isFirstLogin = req.body.isFirstLogin;

    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: {
          name: user.name,
          phone: user.phone,
          birthdate: user.birthdate,
          image: user.image,
          getUpdates: user.getUpdates,
          isFirstLogin: user.isFirstLogin,
        },
        message: "Profile updated successfully",
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

module.exports = editProfile;
