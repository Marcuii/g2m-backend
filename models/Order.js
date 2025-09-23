// Order model
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ["credit_card", "cod", "bank_transfer", "wallet"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sku: { type: String, required: true },
        name: { type: String, required: true },
        mainImage: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true, min: 0 },
      },
    ],

    subTotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    usedVoucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
    totalAmount: { type: Number, required: true, min: 0 },

    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      street1: { type: String, required: true },
      street2: { type: String },
      zip: { type: String },
      phone: { type: String, required: true },
    },
    billingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      street1: { type: String, required: true },
      street2: { type: String },
      zip: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packaged",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    canceledAt: { type: Date, default: null },

    notes: { type: String, default: "" },

    paymentInfo: [transactionSchema],

    // audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin if created manually
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin or system update
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = "ORD-" + Date.now(); // or use a counter system
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
