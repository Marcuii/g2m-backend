// Controller to add user address
const User = require("../../../models/User");

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });

    if (user.addresses.length >= 5)
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Maximum address limit reached",
        },
      });

    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.country ||
      !req.body.state ||
      !req.body.city ||
      !req.body.street1 ||
      !req.body.phone
    ) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "All fields are required",
        },
      });
    }

    user.addresses.push(req.body);
    await user.save();

    return res.status(200).json({
      status: 200,
      data: {
        user: { addresses: user.addresses },
        message: "Address added",
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

module.exports = addAddress;
