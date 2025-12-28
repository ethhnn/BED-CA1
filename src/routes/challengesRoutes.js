const express = require('express');
const router = express.Router();

const wellnessChallengeController = require('../controllers/wellnessChallengeController');
const userCompletionController = require('../controllers/userCompletionController');

// =====================
// COLLECTION ROUTES
// =====================

router.post('/',
  wellnessChallengeController.createNewChallenge //201,400
);

router.get('/',
  wellnessChallengeController.getAllChallenges //200
);

// =====================
// CHALLENGE ACTIONS
// =====================

router.post('/:challenge_id',
  userCompletionController.checkUserExists,//404
  userCompletionController.checkChallengeExistsAndExtractPoints,//404
  userCompletionController.checkActiveCreatureAndExtractBenefit,//404
  userCompletionController.applyCreatureBenefitToPoints,
  userCompletionController.createCompletionRecord,
  userCompletionController.addPoints,
  userCompletionController.incrementEvoChallengeCount,
  userCompletionController.sendStatus//201
);

// =====================
// PARAMETER ROUTES
// =====================

router.get('/:challenge_id',
  userCompletionController.checkAttempts,//404
  userCompletionController.getChallengeById//200
);

router.put('/:challenge_id',
  wellnessChallengeController.errorChecks, //400,404,403
  wellnessChallengeController.updateChallengeById//200
);

router.delete('/:challenge_id',
  userCompletionController.deleteCompletionById,
  wellnessChallengeController.deleteChallengeById//404,200
);

module.exports = router;