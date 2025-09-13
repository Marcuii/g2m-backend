// Routes for authenticated user actions
const express = require('express');
const router = express.Router();

// Importing middleware and controllers
// Middleware to authenticate user using JWT
const userInAuth = require('../middleware/userInAuth');

// Middlware to upload user avatar images
const { avatarUpload } = require('../utils/multer');

// Profile management controllers
const getProfile = require('../controllers/userIn/getProfile'); // General profile retrieval
const editProfile = require('../controllers/userIn/profile/editProfile');
const editPassword = require('../controllers/userIn/profile/editPassword');
const editEmail = require('../controllers/userIn/profile/editEmail');

// Cart management controllers
const addToCart = require('../controllers/userIn/cart/addToCart');
const editCartItem = require('../controllers/userIn/cart/editCartItem');
const deleteCartItem = require('../controllers/userIn/cart/deleteCartItem');
const deleteCart = require('../controllers/userIn/cart/deleteCart');

// Wishlist management controllers
const addToWishlist = require('../controllers/userIn/wishlist/addToWishlist');
const deleteWishlistItem = require('../controllers/userIn/wishlist/deleteWishlistItem');
const deleteWishlist = require('../controllers/userIn/wishlist/deleteWishlist');

// Address management controllers
const addAddress = require('../controllers/userIn/address/addAddress');
const editAddress = require('../controllers/userIn/address/editAddress');
const deleteAddress = require('../controllers/userIn/address/deleteAddress');

// Session management controllers
const deleteSession = require('../controllers/userIn/session/deleteSession');
const deleteSessions = require('../controllers/userIn/session/deleteSessions');

// Routes
// Profile management routes
router.route("/profile").get(userInAuth, getProfile); // General profile retrieval
router.route("/profile").patch(userInAuth, avatarUpload.single("image"), editProfile);
router.route("/profile/edit-password").patch(userInAuth, editPassword);
router.route("/profile/edit-email").patch(userInAuth, editEmail);

// Cart management routes
router.route("/cart").post(userInAuth, addToCart);
router.route("/cart/:productId").patch(userInAuth, editCartItem);
router.route("/cart/:productId").delete(userInAuth, deleteCartItem);
router.route("/cart").delete(userInAuth, deleteCart);

// Wishlist management routes
router.route("/wishlist").post(userInAuth, addToWishlist);
router.route("/wishlist/:productId").delete(userInAuth, deleteWishlistItem);
router.route("/wishlist").delete(userInAuth, deleteWishlist);

// Address management routes
router.route("/address").post(userInAuth, addAddress);
router.route("/address/:addressId").patch(userInAuth, editAddress);
router.route("/address/:addressId").delete(userInAuth, deleteAddress);

// Session management routes
router.route("/sessions/:sessionId").delete(userInAuth, deleteSession);
router.route("/sessions").delete(userInAuth, deleteSessions);

module.exports = router;