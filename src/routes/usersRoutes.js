const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const userCompletionController = require('../controllers/userCompletionController');

// =====================
// FIXED / SPECIFIC ROUTES
// =====================

router.put("/claim",
  userController.validateClaimBody,
  userController.checkUserExistsBody,
  userController.checkNotClaimedToday,
  userController.getTop3Users,
  userController.giveLeaderboardItem,
  userController.markClaimedToday,
  userController.sendClaimSuccess
);

router.get("/leaderboard/top10",
  userController.getTop10Users
);

// =====================
// COLLECTION ROUTES
// =====================

router.post('/',
  userController.checkIfUserExists,
  userController.createNewUser
);

router.get('/',
  userController.getAllUser
);

// =====================
// USER-SCOPED SUB-ROUTES
// =====================

router.get("/:user_id/completions",
  userController.checkUserExists,
  userCompletionController.getCompletionsByUserId
);

router.get("/:user_id/inventory",
  userController.checkUserExists,
  userController.getInventoryByUser
);

// =====================
// PARAMETER ROUTES
// =====================

router.get("/:user_id",
  userController.checkUserExists,
  userController.getUserById
);

router.put("/:user_id",
  userController.checkUserExists,
  userController.checkIfUserExists,
  userController.updateUserById
);


module.exports = router;