// Controller to get all products for admin with filtering, sorting, and pagination
const mongoose = require("mongoose");
const Product = require("../../../models/Product");

// Helper: safely parse booleans from query strings
const parseBool = (v) =>
  typeof v === "string" ? ["true", "1", "yes"].includes(v.toLowerCase()) : !!v;

const getAdminProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      tags, // "tag1,tag2"
      tagsMode = "any", // "any" | "all"
      active, // "true" | "false" (isActive)
      hasDiscount, // true => discountPrice != null
      discountActive, // true | false
      hasImages, // true => images not empty

      // Stock / price / rating filters
      stock, // "in" | "out" | "low"
      lowStockThreshold = 5, // used when stock=low
      minStock,
      maxStock,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      minSold,
      maxSold,

      // Audit filters
      createdBy, // admin id
      updatedBy, // admin id (lastUpdatedBy)

      // Date ranges
      createdFrom, // ISO date
      createdTo, // ISO date
      updatedFrom,
      updatedTo,

      // Search (regex)
      search, // searches name/description/tags/sku

      // Fields selection (optional)
      select, // "field1,field2,-field3"

      // Sorting / pagination
      sortBy = "createdAt", // createdAt | updatedAt | price | stock | sold | avgRating | name
      order = "desc", // asc | desc
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (tags) {
      const arr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (arr.length) {
        filter.tags = tagsMode === "all" ? { $all: arr } : { $in: arr };
      }
    }

    // Visibility (admin sees all by default unless specified)
    if (typeof active !== "undefined") {
      filter.isActive = parseBool(active);
    }

    // Discounts
    if (typeof hasDiscount !== "undefined" && parseBool(hasDiscount)) {
      filter.discountPrice = { $ne: null };
    }
    if (typeof discountActive !== "undefined") {
      filter.discountActive = parseBool(discountActive);
    }

    // Images presence
    if (typeof hasImages !== "undefined" && parseBool(hasImages)) {
      filter.images = { $exists: true, $ne: [] };
    }

    // Stock
    if (stock === "in") filter.stock = { $gt: 0 };
    if (stock === "out") filter.stock = 0;
    if (stock === "low") {
      const th = Number(lowStockThreshold) || 5;
      filter.stock = { $gt: 0, $lte: th };
    }
    // Range overrides (take precedence if provided)
    if (typeof minStock !== "undefined" || typeof maxStock !== "undefined") {
      filter.stock = {};
      if (typeof minStock !== "undefined") filter.stock.$gte = Number(minStock);
      if (typeof maxStock !== "undefined") filter.stock.$lte = Number(maxStock);
    }

    // Price
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rating
    if (typeof minRating !== "undefined" || typeof maxRating !== "undefined") {
      filter.avgRating = {};
      if (typeof minRating !== "undefined")
        filter.avgRating.$gte = Number(minRating);
      if (typeof maxRating !== "undefined")
        filter.avgRating.$lte = Number(maxRating);
      // Clean up if empty
      if (!Object.keys(filter.avgRating).length) delete filter.avgRating;
    }

    // Sold
    if (typeof minSold !== "undefined" || typeof maxSold !== "undefined") {
      filter.sold = {};
      if (typeof minSold !== "undefined") filter.sold.$gte = Number(minSold);
      if (typeof maxSold !== "undefined") filter.sold.$lte = Number(maxSold);
    }

    // Audit filters
    if (createdBy && createdBy.match(/^[0-9a-fA-F]{24}$/)) {
      filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    }
    if (updatedBy && updatedBy.match(/^[0-9a-fA-F]{24}$/)) {
      filter.lastUpdatedBy = new mongoose.Types.ObjectId(updatedBy);
    }

    // Date ranges
    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
      if (createdTo) filter.createdAt.$lte = new Date(createdTo);
    }
    if (updatedFrom || updatedTo) {
      filter.updatedAt = {};
      if (updatedFrom) filter.updatedAt.$gte = new Date(updatedFrom);
      if (updatedTo) filter.updatedAt.$lte = new Date(updatedTo);
    }

    // Search across name/description/tags/SKU
    if (search) {
      const rx = { $regex: search, $options: "i" };
      filter.$or = [
        { sku: rx },
        { name: rx },
        { description: rx },
        { tags: rx },
      ];
    }

    // Sorting
    const allowedSort = new Set([
      "createdAt",
      "updatedAt",
      "price",
      "stock",
      "sold",
      "avgRating",
      "name",
      "sku",
    ]);
    const sortField = allowedSort.has(sortBy) ? sortBy : "createdAt";
    const sortOptions = { [sortField]: order === "asc" ? 1 : -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Field selection (optional)
    // Example: ?select=sku,name,price,-reviews
    let projection = "-__v"; // default: hide __v
    if (select) {
      projection = select
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .join(" ");
    }

    // Query + populate admin info
    const products = await Product.find(filter)
      .select(projection)
      .populate("createdBy lastUpdatedBy", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      status: 200,
      data: {
        products,
        message: "Admin products fetched successfully",
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          sortBy: sortField,
          order: order === "asc" ? "asc" : "desc",
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getAdminProducts;
