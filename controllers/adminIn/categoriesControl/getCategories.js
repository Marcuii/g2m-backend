// Controller to get all categories
const Category = require("../../../models/Category");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    
    return res.status(200).json({
      status: 200,
      data: {
        categories,
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
