// Controller to add a new category
const Category = require("../../../models/Category");

const addCategory = async (req, res) => {
  try {
    const category = req.body;
    if (!category.name || !req.file?.path) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Name and image are required",
        },
      });
    }

    // Check for category name uniqueness
    const existingCategory = await Category.findOne({ name: category.name });
    if (existingCategory) {
      return res.status(400).json({
        status: 400,
        data: {
          data: null,
          message: "Category with this name already exists",
        },
      });
    }

    const newCategory = new Category({
      name: category.name,
      description: category.description || "",
      createdBy: req.user,
      image: req.file.path,
    });

    await newCategory.save();

    return res.status(201).json({
      status: 201,
      data: {
        category: newCategory,
        message: "Category added successfully",
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

module.exports = addCategory;
