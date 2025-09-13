// Product model
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true }, // SKU code
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true }, // Stickers, Skins, Posters, etc.
    subcategory: { type: String, required: true }, // Anime, Nature, Abstract, etc.
    tags: [{ type: String }], // suitable for laptop, phone, wall, etc.
    stock: { type: Number, default: 1 },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    discountActive: { type: Boolean, default: false },

    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    mainImage: { type: String, required: true },
    images: [{ type: String }],
    size: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      depth: { type: Number, required: true },
    },

    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.pre("remove", async function (next) {
  // Ensure related reviews are removed when a product document is removed
  await mongoose.model("Review").deleteMany({ product: this._id });
  next();
});

module.exports = mongoose.model("Product", productSchema);
