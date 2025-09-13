// Controller to get product for admin
const Product = require("../../../models/Product");

const getProduct = async (req, res) => {
  try {
    const { productSKU } = req.params;
    const product = await Product.findOne({ sku: productSKU })
      .populate({
        path: "reviews",
        populate: { path: "user", select: "name image" },
      })
      .populate("reviews", "rating comment createdAt")
      .populate("createdBy lastUpdatedBy", "name");

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
