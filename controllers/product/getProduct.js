// Controller to get product
const Product = require("../../models/Product");
const Review = require("../../models/Review");

const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .select(
        "-isActive -createdBy -lastUpdatedBy -__v -createdAt -updatedAt "
      )
      .populate("category", "name")
      .populate({
        path: "reviews",
        select: "user rating comment images createdAt",
        populate: { path: "user", select: "name image" },
      });

    if (!product) {
      return res.status(404).json({
        status: 404,
        data: { data: null, message: "Product not found" },
      });
    }
    return res.status(200).json({
      status: 200,
      data: {
        product,
        message: "Product fetched successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      data: { data: null, message: err.message },
    });
  }
};

module.exports = getProduct;
