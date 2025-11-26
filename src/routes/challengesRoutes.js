const express = require('express');
const router = express.Router();

const wellnessChallengeController = require('../controllers/wellnessChallengeController');
const userCompletionController = require('../controllers/userCompletionController');

//place longer on top
router.post('/:challenge_id/',userCompletionController.anySuitableFunctionName); //Endpoint 9
router.post('/',wellnessChallengeController.anySuitableFunctionName); //Endpoint 5
module.exports = router;