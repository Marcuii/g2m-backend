// User model with session management for refresh tokens
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  device: { type: String, default: null },
  ip: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: Date.now },
});

const addressSchema = new mongoose.Schema({
  firstName: { type: String, default: null, required: true },
  lastName: { type: String, default: null, required: true },
  country: { type: String, default: null, required: true },
  state: { type: String, default: null, required: true },
  city: { type: String, default: null, required: true },
  street1: { type: String, default: null, required: true },
  street2: { type: String, default: null },
  zip: { type: String, default: null },
  phone: { type: String, default: null, required: true },
  type: { type: String, enum: ["shipping", "billing"], default: "shipping" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: { value: true, message: "Email is required" },
      unique: { value: true, message: "Email already exists" },
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    password: {
      type: String,
      required: { value: true, message: "Password is required" },
    },
    getUpdates: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    birthdate: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    sessions: [sessionSchema],

    isVerified: {
      type: Boolean,
      default: false,
    },
    pendingEmail: {
      type: String,
      default: null,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    pendingEmailExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    orderCount: { type: Number, default: 0 },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [addressSchema],

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30,
    partialFilterExpression: { isVerified: false },
  } // 30 days
);

module.exports = mongoose.model("User", userSchema);
