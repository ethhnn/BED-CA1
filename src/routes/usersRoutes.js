const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const userCompletionController = require('../controllers/userCompletionController');

router.put("/claim",
  userController.validateClaimBody,     // 400
  userController.checkUserExistsBody,       // 404
  userController.checkNotClaimedToday,  // 409
  userController.getTop3Users,          // 403 if not top3
  userController.giveLeaderboardItem,   // 500
  userController.markClaimedToday,      // 500
  userController.sendClaimSuccess       // 200
);
router.get("/leaderboard/top10",
  userController.getTop10Users
);

router.post('/',
    userController.checkIfUserExists,
    userController.createNewUser
); //Endpoint 1
router.get('/',
    userController.getAllUser
); //Endpoint 2
router.get("/:user_id/completions",
  userController.checkUserExists,
  userCompletionController.getCompletionsByUserId
);
router.get("/:user_id/inventory",
  userController.checkUserExists,
  userController.getInventoryByUser
);
router.get("/:user_id", 
    userController.checkUserExists,
    userController.getUserById
); //Endpoint 3
router.put("/:user_id",
    userController.checkUserExists,
    userController.checkIfUserExists,
    userController.updateUserById
); //Endpoint 4


module.exports = router;