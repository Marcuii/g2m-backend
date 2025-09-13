// User authentication routes
const express = require('express');
const router = express.Router();

// Importing middleware and controllers
const register = require('../controllers/userAuth/register');
const loginLimiter = require('../middleware/rateLimit');
const login = require('../controllers/userAuth/login');
const verifyEmail = require('../controllers/userAuth/verifyEmail');
const forgetPassword = require('../controllers/userAuth/forgetPassword');
const resetPassword = require('../controllers/userAuth/resetPassword');
const logout = require('../controllers/userAuth/logout');
const refreshAccessToken = require('../controllers/userAuth/refreshToken');

// Routes
router.route('/register').post(register);
router.route('/login').post(loginLimiter, login);
router.route('/verify/:token/:email').get(verifyEmail);
router.route('/forget-password').post(forgetPassword);
router.route('/reset-password/:token/:email').post(resetPassword);
router.route("/logout").post(logout);
router.route("/refresh").post(refreshAccessToken);

module.exports = router;