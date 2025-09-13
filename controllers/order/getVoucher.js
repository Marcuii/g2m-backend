// Controller to check voucher validity
const Voucher = require("../../models/Voucher");

const getVoucher = async (req, res) => {
  try {
    const { code, subTotal } = req.body;

    if (!code || subTotal == null) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Code and subtotal are required" },
      });
    }

    const voucher = await Voucher.findOne({ code });
    if (!voucher) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Voucher not found" },
      });
    }

    // validate
    if (!voucher.isActive || voucher.expiryDate < Date.now()) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Voucher expired or inactive" },
      });
    }

    if (voucher.usageLimit && voucher.timesUsed >= voucher.usageLimit) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Voucher usage limit reached" },
      });
    }

    if (voucher.minPurchase && subTotal < voucher.minPurchase) {
      return res.status(400).json({
        status: 400,
        data: { data: null, message: "Minimum purchase not met" },
      });
    }

    let discountAmount = 0;
    if (voucher.type === "fixed") {
      discountAmount = voucher.discount;
    } else if (voucher.type === "percentage") {
      discountAmount = (subTotal * voucher.discount) / 100;
    }

    return res.status(200).json({
      status: 200,
      data: {
        voucher: {
          code: voucher.code,
          type: voucher.type,
          discount: voucher.discount,
          expiryDate: voucher.expiryDate,
        },
        discountAmount,
        message: "Voucher applied successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getVoucher;
