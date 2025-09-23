// Controller to edit an existing category
const Category = require("../../../models/Category");

const editCategory = async (req, res) => {
  try {
    const {categoryName} = req.params;
    const updates = req.body;

    // Find the category by ID
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

    // If name is being updated, check for uniqueness
    if (updates.name && updates.name !== category.name) {
      const existingCategory = await Category.findOne({ name: updates.name });
      if (existingCategory) {
        return res.status(400).json({
          status: 400,
          data: {
            data: null,
            message: "Category with this name already exists",
          },
        });
      }
    }
    // If image is being updated, set the new image path
    if (req.file?.path) {
      updates.image = req.file.path;
    }

    updates.lastUpdatedBy = req.user;
    updates.updatedAt = Date.now();

    // Update the category fields
    Object.assign(category, updates);
    await category.save();

    return res.status(200).json({
      status: 200,
      data: {
        category,
        message: "Category updated successfully",
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

module.exports = editCategory;
