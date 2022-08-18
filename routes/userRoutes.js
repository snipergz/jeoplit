const express = require('express');
const router = express.Router();
const {getLogin, postLogin, getSignup, postSignup, getLogout, postForgot} = require('../controllers/userController');

// Login Routes
router.get('/login', getLogin);

router.post('/login', postLogin);

// Signup Routes
router.get('/signup', getSignup);

router.post('/signup', postSignup);

// Logout Route
router.get('/logout', getLogout);

// Password Reset
router.post("/forgot", postForgot);

module.exports = router;