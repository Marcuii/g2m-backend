// Controller for editing a product in the admin panel
const Product = require("../../../models/Product");
const Category = require("../../../models/Category");

const editProduct = async (req, res) => {
  try {
    const { productSKU } = req.params;

    const product = await Product.findOne({ sku: productSKU });
    if (!product) {
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Product not found",
        },
      });
    }

    const productData = req.body;

    // Check for SKU uniqueness if it's being updated
    if (productData.sku) {
      const existingProduct = await Product.findOne({ sku: productData.sku, _id: { $ne: productId } });
      if (existingProduct) {
        return res.status(400).json({
          status: 400,
          data: {
            data: null,
            message: "Another product with this SKU already exists",
          },
        });
      }
    }

    // Check if category is valid
    if (productData.category) {
      const category = await Category.findById(productData.category);
      if (!category) {
        return res.status(400).json({
          status: 400,
          data: {
            data: null,
            message: "Invalid category",
          },
        });
      }

      // If category is changed, update product counts
      if (category._id.toString() !== product.category.toString()) {
        const oldCategory = await Category.findById(product.category);
        if (oldCategory) {
          oldCategory.productCount = Math.max(0, oldCategory.productCount - 1);
          await oldCategory.save();
        }
        category.productCount += 1;
        await category.save();
      }
    }

    // Update tags if provided
    if (productData.tags) {
      productData.tags = productData.tags.split(",");
    }

    // Get existing images and split if they are provided as comma-separated strings
    // To handle if image removal is needed, the client should send an empty string
    if (productData.images === "") {
      productData.images = [];
    } else if (productData.images) {
      productData.images = productData.images.split(",");
    } else {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Images field is required. Send an empty string to remove all images.",
        },
      });
    }

    // Set size from request body if provided
    if (productData.width) {
      productData.size.width = productData.width
      productData.width = undefined; // Remove width from productData to avoid schema issues
    };
    if (productData.height) {
      productData.size.height = productData.height
      productData.height = undefined; // Remove height from productData to avoid schema issues
    };
    if (productData.depth) {
      productData.size.depth = productData.depth
      productData.depth = undefined; // Remove depth from productData to avoid schema issues
    };

    productData.lastUpdatedBy = req.user;

    Object.assign(product, productData);

    // Update mainImage if a new file is uploaded
    if (req.files.mainImage) {
      product.mainImage = req.files.mainImage[0].path;
    }

    // Add new images from the upload, avoiding duplicates
    if (req.files.images) {
      requestedImages = req.files.images.map((file) => file.path);
      requestedImages.forEach((img) => {
        if (!product.images.includes(img)) {
          product.images.push(img);
        }
      });
    }

    await product.save();

    return res.status(200).json({
      status: 200,
      data: {
        product,
        message: "Product updated successfully",
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

module.exports = editProduct;
