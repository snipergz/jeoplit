const express = require('express');
const router = express.Router();

const {postSubmitSet, getPlaySet, postNewSet, postUpdateSet, postUpdateScore, test} = require('../controllers/setController');

router.post('/submitSet', postSubmitSet);

router.get('/playSet', getPlaySet);

router.post('/playWithNewSet', postNewSet);

router.post('/updateSet', postUpdateSet);

router.post('/updateScore', postUpdateScore)

// TEST ROUTE FOR FORMATTING
router.get('/test', test)

module.exports = router;