const express = require('express');
const router = express.Router();
const {getLogin, postLogin, getSignup, postSignup, getLogout, postForgot, checkUsernameDuplicates} = require('../controllers/userController');

// Login Routes
router.route('/login').get(getLogin).post(postLogin);

// Signup Routes
router.route('/signup').get(getSignup).post(postSignup);

// Logout Route
router.get('/logout', getLogout);

// Password Reset
router.post("/forgot", postForgot);

// API
// User Database check for duplicate username
router.get('/userSet/:username', checkUsernameDuplicates);

module.exports = router;