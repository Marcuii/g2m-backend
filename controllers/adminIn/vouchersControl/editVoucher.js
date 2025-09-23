// Controller to edit an existing voucher
const Voucher = require("../../../models/Voucher");

const editVoucher = async (req, res) => {
  try {
    const { voucherId } = req.params;

    if (req.body.code) {
      const existingVoucher = await Voucher.findOne({ code: req.body.code });
      if (existingVoucher && existingVoucher._id.toString() !== voucherId) {
        return res.status(409).json({
          status: 409,
          data: { data: null, message: "Voucher code already exists" },
        });
      }
    }

    const voucher = await Voucher.findByIdAndUpdate(
      voucherId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Voucher not found" },
      });
    }

    return res.status(200).json({
      status: 200,
      data: { voucher, message: "Voucher updated successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = editVoucher;
