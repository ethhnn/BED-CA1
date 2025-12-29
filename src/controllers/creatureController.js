const creatureModel = require("../models/creatureModel");
const userModel = require("../models/userModel");
const MAX_STAGE = 3;

// Retrieve the currently active creature for a user
module.exports.getActiveCreatureById = (req, res) => {
    const data = {
        user_id: req.params.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error getActiveCreatureById:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Active creature not found."
            });
        }

        return res.status(200).json(results[0]);
    };

    creatureModel.getActiveCreatureByUserId(data, callback);
};

// Retrieve all creatures owned by a user
module.exports.getAllCreaturesByUserId = (req, res) => {
    const data = {
        user_id: req.params.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error getAllCreaturesByUserId:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
        return res.status(200).json(results);
    };

    creatureModel.getAllCreaturesByUserId(data, callback);
};

// Validate body for starting creature
module.exports.validateStartCreature = (req, res, next) => {
  const { user_id, creature_id } = req.body;

  if (!user_id || !creature_id) {
    return res.status(400).json({
      message: "user_id and creature_id are required."
    });
  }

  if (isNaN(user_id) || isNaN(creature_id)) {
    return res.status(400).json({
      message: "user_id and creature_id must be numbers."
    });
  }

  next();
};

// Ensure user does NOT already own any creature
module.exports.checkUserHasNoCreature = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkUserHasNoCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "User already has a creature."
      });
    }

    next();
  };

  creatureModel.getCreaturesByUserId(data, callback);
};

// Create starter creature (stage 1, active)
module.exports.createStarterCreature = (req, res) => {
  const data = {
    user_id: req.body.user_id,
    creature_id: req.body.creature_id
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error createStarterCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(201).json({
      message: "Starter creature created successfully."
    });
  };

  creatureModel.insertStarterCreature(data, callback);
};

// Validate body for using item
module.exports.validateUseItemBody = (req, res, next) => {
    const { user_id, item_id, quantity } = req.body;

    if (!user_id || !item_id) {
        return res.status(400).json({
            message: "user_id and item_id are required."
        });
    }

    if (isNaN(user_id) || isNaN(item_id)) {
        return res.status(400).json({
            message: "user_id and item_id must be numbers."
        });
    }

    // quantity optional; default 1
    if (quantity !== undefined) {
        if (isNaN(quantity) || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "quantity must be a positive number."
            });
        }
        req.qty = Number(quantity);
    } else {
        req.qty = 1;
    }

    next();
};

// Check user exists (body user_id)
module.exports.checkUserExists = (req, res, next) => {
    const data = { user_id: req.body.user_id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checkUserExists:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = results[0];
        next();
    };

    userModel.getUserById(data, callback); // if yours is named differently, use that
};

// Check active creature exists
module.exports.checkActiveCreatureExists = (req, res, next) => {
    const data = { user_id: req.body.user_id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checkActiveCreatureExists:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Active creature not found."
            });
        }

        req.activeCreature = results[0];
        next();
    };

    creatureModel.selectActiveCreatureCore(data, callback);
};

// Check inventory has item
module.exports.checkInventoryHasItem = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        item_id: req.body.item_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checkInventoryHasItem:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Item not found in inventory."
            });
        }

        // results[0] contains inventory quantity + satisfaction_gain from ShopItem
        req.inventoryItem = results[0];
        next();
    };

    creatureModel.selectInventoryItemWithGain(data, callback);
};

// Ensure inventory quantity sufficient
module.exports.checkInventoryQuantity = (req, res, next) => {
    const have = Number(req.inventoryItem.quantity);
    const need = Number(req.qty);

    if (have < need) {
        return res.status(409).json({
            message: "Not enough item quantity in inventory."
        });
    }

    next();
};

// Reset daily satisfaction if new day
module.exports.applyDailyResetIfNeeded = (req, res, next) => {
    const data = { user_id: req.body.user_id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error applyDailyResetIfNeeded:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        // refresh active creature core after potential reset
        creatureModel.selectActiveCreatureCore(data, (err2, rows2) => {
            if (err2) {
                console.error("Error selectActiveCreatureCore (after reset):", err2);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (rows2.length === 0) {
                return res.status(404).json({ message: "Active creature not found." });
            }
            req.activeCreature = rows2[0];
            next();
        });
    };

    creatureModel.resetActiveCreatureIfNewDay(data, callback);
};

// Consume item from inventory
module.exports.consumeInventoryItem = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        item_id: req.body.item_id,
        quantity: req.qty
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error consumeInventoryItem:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        // if affectedRows = 0 something went wrong (row missing), but we already checked earlier
        next();
    };

    creatureModel.decreaseInventoryQuantity(data, callback);
};

// Increase creature satisfaction
module.exports.increaseSatisfaction = (req, res, next) => {
    const gainPerItem = Number(req.inventoryItem.satisfaction_gain);
    const totalGain = gainPerItem * Number(req.qty);

    const data = {
        user_id: req.body.user_id,
        add_value: totalGain
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error increaseSatisfaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        next();
    };

    creatureModel.increaseActiveCreatureSatisfaction(data, callback);
};

// Final response for use item
module.exports.sendUseItemResult = (req, res) => {
    const data = { user_id: req.body.user_id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error sendUseItemResult:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Active creature not found." });
        }

        return res.status(200).json({
            message: "Item used successfully.",
            used_item_id: Number(req.body.item_id),
            used_quantity: Number(req.qty),
            satisfaction_gain_each: Number(req.inventoryItem.satisfaction_gain),
            active_creature: results[0]
        });
    };

    creatureModel.selectActiveCreatureFull(data, callback);
};

//Validate body for evolve
module.exports.validateEvolveBody = (req, res, next) => {
  const { user_id } = req.body;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({
      message: "user_id is required and must be a number."
    });
  }

  next();
};

// Block if already max stage
module.exports.checkNotMaxStage = (req, res, next) => {
  if (req.activeCreature.stage >= MAX_STAGE) {
    return res.status(409).json({
      message: "Creature already at max evolution stage."
    });
  }
  next();
};

// Check evolution requirements
module.exports.checkEvolveRequirementsAND = (req, res, next) => {
  const { stage, daily_satisfaction, evo_challenge_count } = req.activeCreature;

  let requiredChallenges;

  if (stage === 1) {
    requiredChallenges = 10;
  } else if (stage === 2) {
    requiredChallenges = 30;
  } else {
    return res.status(409).json({
      message: "Creature already at max evolution stage."
    });
  }

  if (daily_satisfaction < 100 || evo_challenge_count < requiredChallenges) {
    return res.status(409).json({
      message: `Evolution requires satisfaction 100 and ${requiredChallenges} completed challenges.`
    });
  }

  next();
};

// Increase creature stage
module.exports.evolveCreature = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error) => {
    if (error) {
      console.error("Error evolveCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  creatureModel.incrementCreatureStage(data, callback);
};

// Reset evolution progress after evolve
module.exports.resetEvoProgress = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error) => {
    if (error) {
      console.error("Error resetEvoProgress:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  creatureModel.resetAfterEvolution(data, callback);
};

// Final evolve response
module.exports.sendEvolveResult = (req, res) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error sendEvolveResult:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      message: "Creature evolved successfully.",
      active_creature: results[0]
    });
  };

  creatureModel.selectActiveCreatureFull(data, callback);
};

//Validate body for new starter
module.exports.validateNewStarterBody = (req, res, next) => {
  const { user_id, creature_id } = req.body;

  if (!user_id || !creature_id) {
    return res.status(400).json({ message: "user_id and creature_id are required." });
  }
  if (isNaN(user_id) || isNaN(creature_id)) {
    return res.status(400).json({ message: "user_id and creature_id must be numbers." });
  }
  next();
};

//check if creature exist
module.exports.checkCreatureExists = (req, res, next) => {
  const data = { creature_id: req.body.creature_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkCreatureExists:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Creature not found." });
    }
    req.creature = results[0];
    next();
  };

  creatureModel.selectCreatureById(data, callback);
};

//check if all creature owned by user are at max stage(stage3)
module.exports.checkAllOwnedAreStage3 = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkAllOwnedAreStage3:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const notMaxedCount = Number(results[0].notMaxedCount);

    if (notMaxedCount > 0) {
      return res.status(409).json({
        message: "You can only choose a new starter after ALL your creatures reach stage 3."
      });
    }

    next();
  };

  creatureModel.countOwnedCreaturesBelowStage3(data, callback);
};

//check that user does not already own target creature
module.exports.checkUserDoesNotOwnCreature = (req, res, next) => {
  const data = {
    user_id: req.body.user_id,
    creature_id: req.body.creature_id
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkUserDoesNotOwnCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "You already own this creature."
      });
    }

    next();
  };

  creatureModel.selectUserCreatureByUserAndCreature(data, callback);
};

//deactivate all creature(set active to 0)
module.exports.deactivateAllCreatures = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error deactivateAllCreatures:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  creatureModel.deactivateAllUserCreatures(data, callback);
};
module.exports.createNewStarterCreature = (req, res) => {
  const data = {
    user_id: req.body.user_id,
    creature_id: req.body.creature_id
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error createNewStarterCreature:", error);

      // if UNIQUE(user_id, creature_id) exists, this catches duplicate too
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "You already own this creature." });
      }

      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(201).json({
      message: "New starter chosen.",
      user_creature_id: results.insertId,
      user_id: data.user_id,
      creature_id: data.creature_id,
      stage: 1,
      is_active: 1
    });
  };

  creatureModel.insertNewStarterUserCreature(data, callback);
};

//Validate body for switch
module.exports.validateSwitchBody = (req, res, next) => {
  const { user_id, creature_id } = req.body;

  if (!user_id || !creature_id) {
    return res.status(400).json({ message: "user_id and creature_id are required." });
  }
  if (isNaN(user_id) || isNaN(creature_id)) {
    return res.status(400).json({ message: "user_id and creature_id must be numbers." });
  }
  next();
};

// Ensure user owns target creature
module.exports.checkUserOwnsCreature = (req, res, next) => {
  const data = {
    user_id: req.body.user_id,
    creature_id: req.body.creature_id
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkUserOwnsCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User does not own this creature." });
    }

    req.targetUserCreature = results[0]; // includes is_active, stage, etc.
    next();
  };

  creatureModel.selectUserCreatureByUserAndCreature(data, callback);
};

// Block switching to already active creature
module.exports.checkNotAlreadyActive = (req, res, next) => {
  if (Number(req.targetUserCreature.is_active) === 1) {
    return res.status(409).json({ message: "This creature is already active." });
  }
  next();
};

// Activate chosen creature
module.exports.activateChosenCreature = (req, res) => {
  const data = {
    user_id: req.body.user_id,
    creature_id: req.body.creature_id
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error activateChosenCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      // should not happen if checkUserOwnsCreature passed, but defensive
      return res.status(404).json({ message: "User does not own this creature." });
    }

    return res.status(200).json({
      message: "Active creature switched.",
      user_id: data.user_id,
      creature_id: data.creature_id
    });
  };

  creatureModel.activateUserCreatureByUserAndCreature(data, callback);
};

//Get creature's master list
module.exports.getAllCreatures = (req, res) => {
  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json(results);
  };

  creatureModel.getAllCreatures(callback);
};