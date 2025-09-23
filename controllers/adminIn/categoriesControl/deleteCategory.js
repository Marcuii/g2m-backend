// Controller to delete a category
const Category = require("../../../models/Category");
const Product = require("../../../models/Product");

const deleteCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    // Find the category by Name
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({
        status: 404,
        data: {
          data: null,
          message: "Category not found",
        },
      });
    }

    // Check if any products are associated with this category
    const associatedProducts = await Product.find({ category: category._id });
    if (associatedProducts.length > 0) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Cannot delete category with associated products",
        },
      });
    }

    // Delete the category
    await category.deleteOne();
    return res.status(200).json({
      status: 200,
      data: {
        data: null,
        message: "Category deleted successfully",
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

module.exports = deleteCategory;
