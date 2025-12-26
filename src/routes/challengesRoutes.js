const express = require('express');
const router = express.Router();

const wellnessChallengeController = require('../controllers/wellnessChallengeController');
const userCompletionController = require('../controllers/userCompletionController');

// =====================
// COLLECTION ROUTES
// =====================

router.post('/',
  wellnessChallengeController.createNewChallenge
);

router.get('/',
  wellnessChallengeController.getAllChallenges
);

// =====================
// CHALLENGE ACTIONS
// =====================

router.post('/:challenge_id',
  userCompletionController.checkUserExists,
  userCompletionController.checkChallengeExistsAndExtractPoints,
  userCompletionController.checkActiveCreatureAndExtractBenefit,
  userCompletionController.applyCreatureBenefitToPoints,
  userCompletionController.createCompletionRecord,
  userCompletionController.addPoints,
  userCompletionController.incrementEvoChallengeCount,
  userCompletionController.sendStatus
);

// =====================
// PARAMETER ROUTES
// =====================

router.get('/:challenge_id',
  userCompletionController.checkAttempts,
  userCompletionController.getChallengeById
);

router.put('/:challenge_id',
  wellnessChallengeController.errorChecks,
  wellnessChallengeController.updateChallengeById
);

router.delete('/:challenge_id',
  userCompletionController.deleteCompletionById,
  wellnessChallengeController.deleteChallengeById
);

module.exports = router;