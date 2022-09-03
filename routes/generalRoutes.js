const express = require('express');
const router = express.Router();

const {getHome, postHome, getContact, postContact, getAbout, getProfile, get404} = require('../controllers/generalController');

// Home Page Routes
router.get('/home', getHome);

router.post('/returnHome', postHome);

// Contact Page Routes
router.route('/contact').get(getContact).post(postContact);

// About Page Route
router.get('/about', getAbout);

// Profile Page Route
router.get('/profile', getProfile);

// 404 Route
router.get('/404', get404);

module.exports = router;