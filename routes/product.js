// Routes for products
const express = require("express");
const router = express.Router();

const getProduct = require("../controllers/product/getProduct");
const getProducts = require("../controllers/product/getProducts");
const getCategories = require("../controllers/category/getCategories");

router.route("/:productId").get(getProduct);
router.route("/").get(getProducts);
router.route("/c/categories").get(getCategories);

module.exports = router;