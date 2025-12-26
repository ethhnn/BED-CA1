const express = require('express');
const router = express.Router();

const creatureController = require('../controllers/creatureController');

// =====================
// COLLECTION ROUTES
// =====================

router.get("/",
  creatureController.getAllCreatures
);

// =====================
// USER-SCOPED ROUTES
// =====================

router.get("/all/:user_id",
  creatureController.getAllCreaturesByUserId
);

// =====================
// CREATURE ACTIONS
// =====================

router.post("/start",
  creatureController.validateStartCreature,
  creatureController.checkUserExists,
  creatureController.checkUserHasNoCreature,
  creatureController.createStarterCreature
);

router.put("/useitem",
  creatureController.validateUseItemBody,
  creatureController.checkUserExists,
  creatureController.checkActiveCreatureExists,
  creatureController.checkInventoryHasItem,
  creatureController.checkInventoryQuantity,
  creatureController.applyDailyResetIfNeeded,
  creatureController.consumeInventoryItem,
  creatureController.increaseSatisfaction,
  creatureController.sendUseItemResult
);

router.put("/evolve",
  creatureController.validateEvolveBody,
  creatureController.checkUserExists,
  creatureController.checkActiveCreatureExists,
  creatureController.applyDailyResetIfNeeded,
  creatureController.checkNotMaxStage,
  creatureController.checkEvolveRequirementsAND,
  creatureController.evolveCreature,
  creatureController.resetEvoProgress,
  creatureController.sendEvolveResult
);

router.post("/new",
  creatureController.validateNewStarterBody,
  creatureController.checkUserExists,
  creatureController.checkCreatureExists,
  creatureController.checkAllOwnedAreStage3,
  creatureController.checkUserDoesNotOwnCreature,
  creatureController.deactivateAllCreatures,
  creatureController.createNewStarterCreature
);

router.put("/switch",
  creatureController.validateSwitchBody,
  creatureController.checkUserExists,
  creatureController.checkUserOwnsCreature,
  creatureController.checkNotAlreadyActive,
  creatureController.deactivateAllCreatures,
  creatureController.activateChosenCreature
);

// =====================
// PARAMETER ROUTES
// =====================

router.get("/:user_id",
  creatureController.getActiveCreatureById
);


module.exports = router;