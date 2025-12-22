const pool = require("../services/db");

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
module.exports.getCreaturesByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_creature_id
    FROM UserCreature
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
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

// 1) Get active creature core (for resets + updates)
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

// 2) Inventory check + get satisfaction_gain (JOIN ShopItem)
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

// 3) Reset active creature if new day (optional middleware)
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

// 4) Consume inventory item (quantity -= req.qty)
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

// 5) Increase satisfaction on active creature (cap 100)
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

// 6) Return active creature with Creature details (for response)
module.exports.selectActiveCreatureFull = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT
            uc.user_creature_id,
            uc.user_id,
            uc.stage,
            uc.daily_satisfaction,
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


module.exports.incrementCreatureStage = (data, callback) => {
  const SQL = `
    UPDATE UserCreature
    SET stage = stage + 1
    WHERE user_id = ?
      AND is_active = 1;
  `;
  pool.query(SQL, [data.user_id], callback);
};
module.exports.resetAfterEvolution = (data, callback) => {
  const SQL = `
    UPDATE UserCreature
    SET evo_challenge_count = 0
    WHERE user_id = ?
      AND is_active = 1;
  `;
  pool.query(SQL, [data.user_id], callback);
};
module.exports.selectActiveCreatureFull = (data, callback) => {
  const SQL = `
    SELECT
      uc.user_creature_id,
      uc.user_id,
      uc.stage,
      uc.daily_satisfaction,
      uc.evo_challenge_count,
      c.creature_id,
      c.name AS creature_name
    FROM UserCreature uc
    INNER JOIN Creature c
      ON uc.creature_id = c.creature_id
    WHERE uc.user_id = ?
      AND uc.is_active = 1;
  `;
  pool.query(SQL, [data.user_id], callback);
};

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
module.exports.countUserCompletionsByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT COUNT(*) AS total
    FROM UserCompletion
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
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