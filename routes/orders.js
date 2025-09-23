// Routes for orders management
const express = require('express');
const router = express.Router();

// Importing middleware and controllers
// Middleware to authenticate user using JWT
const userInAuth = require('../middleware/userInAuth');

// Order management controllers
const getVoucher = require('../controllers/voucher/getVoucher'); // for voucher validation
const getOrder = require('../controllers/order/getOrder');
const getOrders = require('../controllers/order/getOrders');
const addOrder = require('../controllers/order/addOrder');
const cancelOrder = require('../controllers/order/cancelOrder');

// Routes
// Order management routes
router.route('/voucher').get(userInAuth, getVoucher);
router.route('/:orderNumber').get(userInAuth, getOrder);
router.route('/').get(userInAuth, getOrders);
router.route('/').post(userInAuth, addOrder);
router.route('/:orderNumber').patch(userInAuth, cancelOrder);

module.exports = router;