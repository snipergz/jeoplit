const express = require('express');
const router = express.Router();

const {getHome, postHome, getContact, postContact, getAbout} = require('../controllers/generalController');

router.get('/home', getHome);

router.post('/returnHome', postHome);

//ROUTES AT THE MOMENT DO NOT NEED CHANGE
router.get('/contact', getContact);

router.post('/contact', postContact);

router.get('/about', getAbout);

module.exports = router;