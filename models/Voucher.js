// Voucher model
const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    type: Number,
    default: 1,
  },
  timesUsed: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Voucher", voucherSchema);
