const pool = require("../services/db");

// Retrieve the active creature for a user
module.exports.getActiveCreatureByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT
            uc.user_creature_id,
            uc.user_id,
            uc.stage,
            uc.daily_satisfaction,
            uc.last_reset_date,
            c.creature_id,
            c.name,
            c.benefit_type,
            c.stage2_value,
            c.stage3_value
        FROM UserCreature uc
        INNER JOIN Creature c
            ON uc.creature_id = c.creature_id
        WHERE uc.user_id = ?
          AND uc.is_active = 1;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve all creatures owned by a user
module.exports.getAllCreaturesByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT
            uc.user_creature_id,
            uc.user_id,
            uc.stage,
            uc.daily_satisfaction,
            uc.is_active,
            c.creature_id,
            c.name,
            c.benefit_type,
            c.stage2_value,
            c.stage3_value
        FROM UserCreature uc
        INNER JOIN Creature c
            ON uc.creature_id = c.creature_id
        WHERE uc.user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve only creature IDs owned by a user
module.exports.getCreaturesByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_creature_id
    FROM UserCreature
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Insert starter creature for a new user
module.exports.insertStarterCreature = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserCreature
      (user_id, creature_id, stage, daily_satisfaction, last_reset_date, is_active)
    VALUES
      (?, ?, 1, 0, CURDATE(), 1);
  `;
  const VALUES = [data.user_id, data.creature_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve core data of the active creature
module.exports.selectActiveCreatureCore = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT
            uc.user_creature_id,
            uc.user_id,
            uc.creature_id,
            uc.stage,
            uc.daily_satisfaction,
            uc.last_reset_date,
            uc.is_active
        FROM UserCreature uc
        WHERE uc.user_id = ?
          AND uc.is_active = 1;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Check inventory item and retrieve satisfaction gain
module.exports.selectInventoryItemWithGain = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT
            ui.inventory_id,
            ui.user_id,
            ui.item_id,
            ui.quantity,
            si.satisfaction_gain
        FROM UserInventory ui
        INNER JOIN ShopItem si
            ON ui.item_id = si.item_id
        WHERE ui.user_id = ?
          AND ui.item_id = ?;
    `;
    const VALUES = [data.user_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Reset daily satisfaction if a new day has started
module.exports.resetActiveCreatureIfNewDay = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserCreature
        SET daily_satisfaction = 0,
            last_reset_date = CURDATE()
        WHERE user_id = ?
          AND is_active = 1
          AND (last_reset_date IS NULL OR last_reset_date <> CURDATE());
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Decrease inventory quantity after item consumption
module.exports.decreaseInventoryQuantity = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserInventory
        SET quantity = quantity - ?
        WHERE user_id = ?
          AND item_id = ?;
    `;
    const VALUES = [data.quantity, data.user_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Increase satisfaction on active creature (capped at 100)
module.exports.increaseActiveCreatureSatisfaction = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserCreature
        SET daily_satisfaction = LEAST(100, daily_satisfaction + ?)
        WHERE user_id = ?
          AND is_active = 1;
    `;
    const VALUES = [data.add_value, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve full active creature data
module.exports.selectActiveCreatureFull = (data, callback) =>
{
    const SQLSTATEMENT = `
        SELECT
            uc.user_creature_id,
            uc.user_id,
            uc.stage,
            uc.daily_satisfaction,
            uc.evo_challenge_count,
            uc.last_reset_date,
            uc.is_active,
            c.creature_id,
            c.name AS creature_name,
            c.benefit_type,
            c.stage2_value,
            c.stage3_value
        FROM UserCreature uc
        INNER JOIN Creature c
            ON uc.creature_id = c.creature_id
        WHERE uc.user_id = ?
          AND uc.is_active = 1;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Increase creature stage during evolution
module.exports.incrementCreatureStage = (data, callback) => {
  const SQL = `
    UPDATE UserCreature
    SET stage = stage + 1
    WHERE user_id = ?
      AND is_active = 1;
  `;
  pool.query(SQL, [data.user_id], callback);
};

// Reset evolution challenge counter after evolution
module.exports.resetAfterEvolution = (data, callback) => {
  const SQL = `
    UPDATE UserCreature
    SET evo_challenge_count = 0
    WHERE user_id = ?
      AND is_active = 1;
  `;
  pool.query(SQL, [data.user_id], callback);
};

// Retrieve benefit data of active creature
module.exports.selectActiveCreatureBenefitByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
      uc.user_creature_id,
      uc.user_id,
      uc.creature_id,
      uc.stage,
      c.name AS creature_name,
      c.benefit_type,
      c.stage2_value,
      c.stage3_value
    FROM UserCreature uc
    INNER JOIN Creature c
      ON uc.creature_id = c.creature_id
    WHERE uc.user_id = ?
      AND uc.is_active = 1;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Count total completed challenges by user
module.exports.countUserCompletionsByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT COUNT(*) AS total
    FROM UserCompletion
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Increment evolution challenge counter
module.exports.incrementEvoChallengeCount = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE UserCreature
    SET evo_challenge_count = evo_challenge_count + 1
    WHERE user_id = ?
      AND is_active = 1;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve creature master data by ID
module.exports.selectCreatureById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Creature
    WHERE creature_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.creature_id], callback);
};

// Count owned creatures that are not max stage
module.exports.countOwnedCreaturesBelowStage3 = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT COUNT(*) AS notMaxedCount
    FROM UserCreature
    WHERE user_id = ?
      AND stage < 3;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// Check if user already owns a specific creature
module.exports.selectUserCreatureByUserAndCreature = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_creature_id,is_active, stage
    FROM UserCreature
    WHERE user_id = ?
      AND creature_id = ?
    LIMIT 1;
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.creature_id], callback);
};

// Deactivate all creatures for a user
module.exports.deactivateAllUserCreatures = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE UserCreature
    SET is_active = 0
    WHERE user_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// Insert a new starter creature
module.exports.insertNewStarterUserCreature = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserCreature
      (user_id, creature_id, stage, daily_satisfaction, evo_challenge_count, last_reset_date, is_active)
    VALUES
      (?, ?, 1, 0, 0, CURDATE(), 1);
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.creature_id], callback);
};

// Activate a specific creature for a user
module.exports.activateUserCreatureByUserAndCreature = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE UserCreature
    SET is_active = 1
    WHERE user_id = ?
      AND creature_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.creature_id], callback);
}

// Retrieve all available creatures
module.exports.getAllCreatures = (callback) => {
  const SQLSTATEMENT = `
    SELECT
      creature_id,
      name,
      description,
      benefit_type,
      stage2_value,
      stage3_value
    FROM Creature;
  `;
  pool.query(SQLSTATEMENT, callback);
};