// Controller to add a new product
const Product = require("../../../models/Product");
const Category = require("../../../models/Category");

const addProduct = async (req, res) => {
  try {
    const product = req.body;
    if (
      !product.sku ||
      !product.name ||
      !product.category ||
      !product.subcategory ||
      !product.tags ||
      !product.price ||
      !req.files.mainImage?.[0]?.path
    ) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "All fields are required",
        },
      });
    }

    // Check for SKU uniqueness
    const existingProduct = await Product.findOne({ sku: product.sku });
    if (existingProduct) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Product with this SKU already exists",
        },
      });
    }

    // Check if category is valid
    const category = await Category.findById(product.category);
    if (!category) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Invalid category",
        },
      });
    }

    category.productCount += 1;
    await category.save();
    
    // Set default description if not provided (auto-generate)
    if (product.description === undefined) {
      const catName = category.name.toLowerCase();
      product.description = `${product.name} ${product.subcategory} ${catName.slice(0, -1)} suitable for ${product.tags}`;
    } else {
      product.description = product.description;
    }

    // Convert tags from comma-separated string to array
    product.tags = product.tags.split(",");

    // Set images from uploaded files
    if (req.files?.images) {
      product.images = req.files.images.map((file) => file.path);
    }

    // Set size from request body
    if (!product.width || !product.height) {
      if (product.category.toLowerCase() === "stickers") {
        product.size = { width: 5, height: 6.25, depth: 0.1 }; // Default size for stickers
      } else if (product.category.toLowerCase() === "skins") {
        product.size = { width: 13.75, height: 9.625, depth: 0.1 }; // Default size for skins
      } else if (product.category.toLowerCase() === "posters") {
        product.size = { width: 18, height: 24, depth: 0.1 }; // Default size for posters
      } else {
        product.size = { width: 0, height: 0, depth: 0 }; // Default size for other categories
      }
    } else if (!product.depth) {
      product.size.depth = 0.1; // Default depth if not provided
    } else {
      product.size = {
        width: Number(product.width),
        height: Number(product.height),
        depth: Number(product.depth),
      };
    }
    product.width = undefined;
    product.height = undefined;
    product.depth = undefined;

    const newProduct = new Product({
      ...product,
      mainImage: req.files.mainImage[0].path,
      createdBy: req.user,
    });

    await newProduct.save();

    return res.status(201).json({
      status: 201,
      data: {
        product: newProduct,
        message: "Product added successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: {
        data: null,
        message: err.message,
      },
    });
  }
};

module.exports = addProduct;
