const creatureModel = require("../models/creatureModel");
const userModel = require("../models/userModel");
const MAX_STAGE = 3;
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

module.exports.validateEvolveBody = (req, res, next) => {
  const { user_id } = req.body;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({
      message: "user_id is required and must be a number."
    });
  }

  next();
};
module.exports.checkNotMaxStage = (req, res, next) => {
  if (req.activeCreature.stage >= MAX_STAGE) {
    return res.status(409).json({
      message: "Creature already at max evolution stage."
    });
  }
  next();
};
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
module.exports.checkNotAlreadyActive = (req, res, next) => {
  if (Number(req.targetUserCreature.is_active) === 1) {
    return res.status(409).json({ message: "This creature is already active." });
  }
  next();
};
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


module.exports.getAllCreatures = (req, res) => {
  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json(results);
  };

  creatureModel.getAllCreatures(callback);
};