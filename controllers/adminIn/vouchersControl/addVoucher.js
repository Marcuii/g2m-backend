// Controller to add a new voucher
const Voucher = require("../../../models/Voucher");

const addVoucher = async (req, res) => {
  try {
    const { code, discount, type, expiryDate, minPurchase, usageLimit } =
      req.body;
    if (!code || !discount || !type || !expiryDate) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Missing required fields" },
      });
    }

    // ensure code uniqueness
    const exists = await Voucher.findOne({ code });
    if (exists) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Voucher code already exists" },
      });
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase(),
      discount,
      type,
      expiryDate,
      minPurchase,
      usageLimit,
    });

    return res.status(201).json({
      status: 201,
      data: { voucher, message: "Voucher created successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = addVoucher;
