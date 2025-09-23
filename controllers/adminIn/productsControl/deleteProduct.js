// Controller for deleting a product in the admin panel
const Product = require("../../../models/Product");
const Category = require("../../../models/Category");

const deleteProduct = async (req, res) => {
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

    const category = await Category.findById(product.category);
    if (category) {
      category.productCount = Math.max(0, category.productCount - 1);
      await category.save();
    }

    await product.deleteOne();

    return res.status(200).json({
      status: 200,
      data: {
        data: null,
        message: "Product deleted successfully",
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

module.exports = deleteProduct;
