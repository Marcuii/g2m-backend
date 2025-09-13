// Routes for authenticated admin actions
const express = require('express');
const router = express.Router();

// Importing middleware and controllers
// Middleware to authenticate admin using JWT
const adminInAuth = require('../middleware/adminInAuth');

// Middleware to handle file uploads
const { productUpload } = require('../utils/multer');

// Announcement controller
const sendAnnouncement = require('../controllers/adminIn/sendAnnouncement');

// User management controllers
const getUserStats = require('../controllers/adminIn/usersControl/getUserStats');
const getUser = require('../controllers/adminIn/usersControl/getUser');
const getUsers = require('../controllers/adminIn/usersControl/getUsers');
const editUserRole = require('../controllers/adminIn/usersControl/editUserRole');

// Product management controllers
const getProducts = require('../controllers/adminIn/productsControl/getProducts');
const getProduct = require('../controllers/adminIn/productsControl/getProduct');
const addProduct = require('../controllers/adminIn/productsControl/addProduct');
const editProduct = require('../controllers/adminIn/productsControl/editProduct');
const deleteProduct = require('../controllers/adminIn/productsControl/deleteProduct');

// Order management controllers
const getOrders = require('../controllers/adminIn/ordersControl/getOrders');
const editOrderStatus = require('../controllers/adminIn/ordersControl/editOrderStatus');

// Review management controllers
const getReviews = require('../controllers/adminIn/reviewsControl/getReviews');
const deleteReview = require('../controllers/adminIn/reviewsControl/deleteReview');

// Voucher management controllers
const getVouchers = require('../controllers/adminIn/vouchersControl/getVouchers');
const addVoucher = require('../controllers/adminIn/vouchersControl/addVoucher');
const editVoucher = require('../controllers/adminIn/vouchersControl/editVoucher');
const deleteVoucher = require('../controllers/adminIn/vouchersControl/deleteVoucher');

// Notifications controllers
const getNotifications = require('../controllers/adminIn/notificationsSystem/getNotifications');
const markNotificationRead = require('../controllers/adminIn/notificationsSystem/markNotificationRead');
const markNotificationsRead = require('../controllers/adminIn/notificationsSystem/markNotificationsRead');

// Routes
// Announcement route
router.route('/announcement').post(adminInAuth, sendAnnouncement);

// User management routes
router.route('/users/stats').get(adminInAuth, getUserStats);
router.route('/users/:userId').get(adminInAuth, getUser);
router.route('/users').get(adminInAuth, getUsers);
router.route('/users/:userId').patch(adminInAuth, editUserRole);


// Product management routes
router.route('/products').get(adminInAuth, getProducts);
router.route('/products/:productSKU').get(adminInAuth, getProduct);
router.route('/products').post(adminInAuth, productUpload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 5 }]), addProduct);
router.route('/products/:productSKU').patch(adminInAuth, productUpload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 5 }]), editProduct);
router.route('/products/:productSKU').delete(adminInAuth, deleteProduct);

// Order management routes
router.route('/orders').get(adminInAuth, getOrders);
router.route('/orders/:orderNumber').patch(adminInAuth, editOrderStatus);

// Review management routes
router.route('/reviews').get(adminInAuth, getReviews);
router.route('/reviews/:reviewId').delete(adminInAuth, deleteReview);

// Voucher management routes
router.route('/vouchers').get(adminInAuth, getVouchers);
router.route('/vouchers').post(adminInAuth, addVoucher);
router.route('/vouchers/:voucherId').patch(adminInAuth, editVoucher);
router.route('/vouchers/:voucherId').delete(adminInAuth, deleteVoucher);

// Notifications routes
router.route('/notifications').get(adminInAuth, getNotifications);
router.route('/notifications/:notificationId').patch(adminInAuth, markNotificationRead);
router.route('/notifications/read-all').patch(adminInAuth, markNotificationsRead);

module.exports = router;