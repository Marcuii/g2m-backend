// Routes for products
const express = require("express");
const router = express.Router();

const getProduct = require("../controllers/product/getProduct");
const getProducts = require("../controllers/product/getProducts");

router.route("/:productId").get(getProduct);
router.route("/").get(getProducts);

module.exports = router;