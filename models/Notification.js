// Notification model
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["order", "review", "stock", "voucher", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null }, // e.g. /orders/:id
    read: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    recipientRole: {
      type: String,
      enum: ["admin", "customer"],
      default: "admin",
    },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Notification", notificationSchema);