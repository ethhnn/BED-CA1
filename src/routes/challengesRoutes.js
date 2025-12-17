const express = require('express');
const router = express.Router();

const wellnessChallengeController = require('../controllers/wellnessChallengeController');
const userCompletionController = require('../controllers/userCompletionController');

router.post('/',
    wellnessChallengeController.createNewChallenge
); //Endpoint 5
router.get('/',
    wellnessChallengeController.getAllChallenges
); //Endpoint 6
router.delete('/:challenge_id',
    wellnessChallengeController.deleteChallengeById
); //Endpoint 7
router.put('/:challenge_id',
    wellnessChallengeController.checkOwner,
    wellnessChallengeController.updateChallengeById
); //Endpoint 8

module.exports = router;