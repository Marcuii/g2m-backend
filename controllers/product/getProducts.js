// Controller to get products with filtering, sorting, and pagination
const Product = require("../../models/Product");

const getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      tags,
      stock,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = "createdAt", // default sort
      order = "desc", // asc | desc
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { isActive: true }; // only active products

    // Category / Subcategory filter
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    // Tags filter (one or multiple tags)
    if (tags) filter.tags = { $in: tags.split(",") };

    // Stock filter
    if (stock === "in") filter.stock = { $gt: 0 };

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) filter.avgRating = { $gte: Number(minRating) };

    // Search filter
    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    const allowedSort = new Set([
      "createdAt",
      "price",
      "sold",
      "avgRating",
      "name",
    ]);
    const sortField = allowedSort.has(sortBy) ? sortBy : "createdAt";
    const sortOptions = { [sortField]: order === "asc" ? 1 : -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const products = await Product.find(filter)
      .select("-isActive -createdBy -lastUpdatedBy -__v -createdAt -updatedAt ")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      status: 200,
      data: {
        products,
        message: "Products fetched successfully",
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          sortBy,
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

module.exports = getProducts;
