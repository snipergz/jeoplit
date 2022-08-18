const express = require('express');
const router = express.Router();

const {getHome, postHome, getContact, postContact, getAbout} = require('../controllers/generalController');

// Home Page Routes
router.get('/home', getHome);

router.post('/returnHome', postHome);

// Contact Page Routes
router.route('/contact').get(getContact).post(postContact);

// About Page Route
router.get('/about', getAbout);

module.exports = router;