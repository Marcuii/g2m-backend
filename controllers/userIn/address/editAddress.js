// Controller to update an existing address for the authenticated user
const User = require("../../../models/User");

const editAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user);
    if (!user)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "User not found",
        },
      });

    const address = user.addresses.id(addressId);
    if (!address)
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Address not found",
        },
      });

    Object.assign(address, req.body);
    address.updatedAt = Date.now();

    await user.save();
    return res.status(200).json({
      status: 200,
      data: {
        user: { addresses: user.addresses },
        message: "Address updated",
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

module.exports = editAddress;
