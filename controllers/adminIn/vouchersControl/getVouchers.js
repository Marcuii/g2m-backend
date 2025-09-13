// Controller to get all vouchers
const Voucher = require("../../../models/Voucher");

const getVouchers = async (req, res) => {
  try {
    const {
      code,
      isActive,
      type,
      expired,
      minDiscount,
      maxDiscount,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};

    if (code) query.code = { $regex: code, $options: "i" };
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (type) query.type = type;
    if (expired === "true") query.expiryDate = { $lt: new Date() };
    if (expired === "false") query.expiryDate = { $gte: new Date() };
    if (minDiscount)
      query.discount = { ...query.discount, $gte: Number(minDiscount) };
    if (maxDiscount)
      query.discount = { ...query.discount, $lte: Number(maxDiscount) };

    const vouchers = await Voucher.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Voucher.countDocuments(query);

    return res.status(200).json({
      status: 200,
      data: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        vouchers,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getVouchers;
