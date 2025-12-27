const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const userCompletionController = require('../controllers/userCompletionController');

// =====================
// FIXED / SPECIFIC ROUTES
// =====================

router.put("/claim",
  userController.validateClaimBody,        // 400
  userController.checkUserExistsBody,      // 404
  userController.checkNotClaimedToday,     // 409
  userController.getTop3Users,             // 403
  userController.giveLeaderboardItem,      
  userController.markClaimedToday,       
  userController.sendClaimSuccess          // 200
);

router.get("/leaderboard/top10",
  userController.getTop10Users //200
);

// =====================
// COLLECTION ROUTES
// =====================

router.post('/',
  userController.checkIfUserExists,//409
  userController.createNewUser//201
);

router.get('/',
  userController.getAllUser//200
);

// =====================
// USER-SCOPED SUB-ROUTES
// =====================

router.get("/:user_id/completions",
  userController.checkUserExists,//404
  userCompletionController.getCompletionsByUserId//200
);

router.get("/:user_id/inventory",
  userController.checkUserExists,//404
  userController.getInventoryByUser//200
);

// =====================
// PARAMETER ROUTES
// =====================

router.get("/:user_id",
  userController.checkUserExists,//404
  userController.getUserById//200
);

router.put("/:user_id",
  userController.checkUserExists,//404 
  userController.checkIfUserExists,//409 & 400
  userController.updateUserById//200
);


module.exports = router;