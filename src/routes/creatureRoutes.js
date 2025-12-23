const express = require('express');
const router = express.Router();

const creatureController = require('../controllers/creatureController');

router.get('/:user_id',
    creatureController.getActiveCreatureById
)
router.get('/all/:user_id',
    creatureController.getAllCreaturesByUserId
)
router.post("/start",
  creatureController.validateStartCreature,
  creatureController.checkUserExists,
  creatureController.checkUserHasNoCreature,
  creatureController.createStarterCreature
);

router.put("/useitem",
  creatureController.validateUseItemBody,        // 400
  creatureController.checkUserExists,            // 404
  creatureController.checkActiveCreatureExists,  // 404

  creatureController.checkInventoryHasItem,      // 404: not in inventory / never bought
  creatureController.checkInventoryQuantity,     // 409: quantity <= 0

  creatureController.applyDailyResetIfNeeded,
  creatureController.consumeInventoryItem,       // quantity -= 1
  creatureController.increaseSatisfaction,       // +satisfaction (cap 100)

  creatureController.sendUseItemResult            // 200
);
router.put("/evolve",

  creatureController.validateEvolveBody,          // 400: missing / invalid user_id
  creatureController.checkUserExists,              // 404: user not found
  creatureController.checkActiveCreatureExists,    // 404: no active creature

  creatureController.applyDailyResetIfNeeded,      // ensure today’s satisfaction is valid
  creatureController.checkNotMaxStage,             // 409: already final evolution

  creatureController.checkEvolveRequirementsAND,   // 409: satisfaction < 100 OR evo_challenge_count < X

  creatureController.evolveCreature,               // stage + 1
  creatureController.resetEvoProgress,              // evo_challenge_count = 0
  creatureController.sendEvolveResult               // 200
);

router.post(
  "/new",
  creatureController.validateNewStarterBody,     // 400
  creatureController.checkUserExists,            // 404
  creatureController.checkCreatureExists,        // 404
  creatureController.checkAllOwnedAreStage3,     // 409
  creatureController.checkUserDoesNotOwnCreature,// 409
  creatureController.deactivateAllCreatures,     // next()
  creatureController.createNewStarterCreature,   // 201
);


module.exports = router;