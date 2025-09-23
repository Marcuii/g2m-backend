// Controller to get all categories for user
const Category = require("../../models/Category");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().select('-createdAt -updatedAt -createdBy -lastUpdatedBy -__v');
    const filteredCategories = categories.filter(
      (category) => category.isActive
    );
    return res.status(200).json({
      status: 200,
      data: {
        categories: filteredCategories,
        message: "Categories retrieved successfully",
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

module.exports = getCategories;
