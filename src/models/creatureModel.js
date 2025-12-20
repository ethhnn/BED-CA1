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