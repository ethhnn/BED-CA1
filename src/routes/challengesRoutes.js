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
    userCompletionController.deleteCompletionById,
    wellnessChallengeController.deleteChallengeById
); //Endpoint 7
router.put('/:challenge_id',
    wellnessChallengeController.errorChecks,
    wellnessChallengeController.updateChallengeById
); //Endpoint 8
router.post('/:challenge_id',
    userCompletionController.checkUserExists,
    userCompletionController.checkChallengeExistsAndExtractPoints,
    userCompletionController.checkActiveCreatureAndExtractBenefit,
    userCompletionController.applyCreatureBenefitToPoints,
    userCompletionController.createCompletionRecord,
    userCompletionController.addPoints,
    userCompletionController.incrementEvoChallengeCount,
    userCompletionController.sendStatus
); //Endpoint 9
router.get('/:challenge_id',
    userCompletionController.checkAttempts,
    userCompletionController.getChallengeById
); //Endpoint 10
module.exports = router;