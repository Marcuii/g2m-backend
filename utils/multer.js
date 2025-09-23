// Utility file for configuring multer with Cloudinary storage for product and avatar image uploads
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary storage for different upload types
// Product images will be stored in 'g2m/products' folder
const productsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = "g2m/products";
    const productSKU = req.body.sku || req.params.productSKU || "temp"; // must come from req

    // detect if it's mainImage or additional images
    if (file.fieldname === "mainImage") {
      return {
        folder,
        allowed_formats: ["jpg", "png", "jpeg"],
        public_id: `${productSKU}_main`, // always overwrite main
      };
    }

    if (file.fieldname === "images") {
      // index images to keep 1–5 consistent
      // multer gives files in array order, we can use originalname or index
      const index = (req._imageIndex = (req._imageIndex || 0) + 1);
      return {
        folder,
        allowed_formats: ["jpg", "png", "jpeg"],
        public_id: `${productSKU}_extra_${index}`, // product_123_extra_1 … product_123_extra_5
      };
    }

    return {
      folder,
      allowed_formats: ["jpg", "png", "jpeg"],
    };
  },
});

// Category images will be stored in 'g2m/categories' folder
const categoriesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "g2m/categories",
    allowedFormats: ["jpg", "png", "jpeg"],
    public_id: async (req, file) => {
      const catName = req.body.name || req.params.categoryName || "temp"; // must come from req
      return `category_${catName}`;
    }
  },
});

// Avatar images will be stored in 'g2m/avatars' folder
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "g2m/avatars",
    allowedFormats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => `user_${req.user}_avatar`,
  },
});

// Review images will be stored in 'g2m/reviews' folder
const reviewStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = "g2m/reviews";
    const productId = req.params.productId || "temp"; // must come from req

    return {
      folder,
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: `${productId}_${req.user}_review_${req._imageIndex || 1}`,
    };
  },
});

const productUpload = multer({ storage: productsStorage });
const categoryUpload = multer({ storage: categoriesStorage });
const avatarUpload = multer({ storage: avatarStorage });
const reviewUpload = multer({ storage: reviewStorage });

module.exports = { productUpload, categoryUpload, avatarUpload, reviewUpload };
