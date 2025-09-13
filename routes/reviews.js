// Routes for adding reviews
const express = require('express');
const router = express.Router();

// Importing middleware and controllers
// Middleware to authenticate user using JWT
const userInAuth = require('../middleware/userInAuth');

// Import multer for handling review image uploads
const { reviewUpload } = require('../utils/multer');

// Review management controllers
const addReview = require('../controllers/review/addReview');
const getReviews = require('../controllers/review/getReviews');

// Routes
// Review management routes
router.route('/:productId').post(userInAuth, reviewUpload.fields([{ name: 'images', maxCount: 2 }]), addReview);
router.route('/').get(userInAuth, getReviews);

module.exports = router;