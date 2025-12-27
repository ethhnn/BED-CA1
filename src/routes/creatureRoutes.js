const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const creatureController = require('../controllers/creatureController');

// =====================
// COLLECTION ROUTES
// =====================

router.get("/",
  creatureController.getAllCreatures //200
);

// =====================
// USER-SCOPED ROUTES
// =====================

router.get("/all/:user_id",
  userController.checkUserExists,//404
  creatureController.getAllCreaturesByUserId //200
);

// =====================
// CREATURE ACTIONS
// =====================

router.post("/start",
  creatureController.validateStartCreature,//400
  creatureController.checkUserExists,//404
  creatureController.checkCreatureExists,//404
  creatureController.checkUserHasNoCreature,//409
  creatureController.createStarterCreature//201
);

router.put("/useitem",
  creatureController.validateUseItemBody,//400
  creatureController.checkUserExists,//404
  creatureController.checkActiveCreatureExists,//404
  creatureController.checkInventoryHasItem,//404
  creatureController.checkInventoryQuantity,//409
  creatureController.applyDailyResetIfNeeded,
  creatureController.consumeInventoryItem,
  creatureController.increaseSatisfaction,
  creatureController.sendUseItemResult//200
);

router.put("/evolve",
  creatureController.validateEvolveBody,//400
  creatureController.checkUserExists,//404
  creatureController.checkActiveCreatureExists,//404
  creatureController.applyDailyResetIfNeeded,
  creatureController.checkNotMaxStage,//409
  creatureController.checkEvolveRequirementsAND,//409
  creatureController.evolveCreature,
  creatureController.resetEvoProgress,
  creatureController.sendEvolveResult//200
);

router.post("/new",
  creatureController.validateNewStarterBody,//400
  creatureController.checkUserExists,//404
  creatureController.checkCreatureExists,//404
  creatureController.checkAllOwnedAreStage3,//409
  creatureController.checkUserDoesNotOwnCreature,//409
  creatureController.deactivateAllCreatures,
  creatureController.createNewStarterCreature//201
);

router.put("/switch",
  creatureController.validateSwitchBody,//400
  creatureController.checkUserExists,//404
  creatureController.checkUserOwnsCreature,//404
  creatureController.checkNotAlreadyActive,//409
  creatureController.deactivateAllCreatures,
  creatureController.activateChosenCreature//200
);

// =====================
// PARAMETER ROUTES
// =====================

router.get("/:user_id",
  userController.checkUserExists,//404
  creatureController.getActiveCreatureById//200,404
);


module.exports = router;