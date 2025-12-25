const pool = require('../services/db');

module.exports.checkIfUserExists = (data, callback) =>
{ 
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE username = ?;
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.createNewUser = (data, callback) =>
{
    const SQLSTATEMENT = `
    INSERT INTO user (username)
    VALUES (?);
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.getAllUser = (callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM user
    `;
    pool.query(SQLSTATEMENT, callback);
}
module.exports.checkUserExists = (data, callback) =>
{ 
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.getUserById = (data,callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?
    `;
    const VALUES = [data.user_id]
    pool.query(SQLSTATEMENT,VALUES, callback);
}
module.exports.updateUserById = (data,callback) =>{
    const SQLSTATEMENT = `
    UPDATE user 
    SET username = ?, points =? 
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.points, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.deductPoints = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE user
    SET points = points - ?
    WHERE user_id = ?;
  `;
  const VALUES = [data.cost, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


module.exports.selectTop3UsersByPoints = (callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, points
    FROM user
    ORDER BY points DESC, user_id ASC
    LIMIT 3;
  `;
  pool.query(SQLSTATEMENT, [], callback);
};
module.exports.addItemToInventoryUpsert = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserInventory (user_id, item_id, quantity)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE quantity = quantity + 1;
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.item_id], callback);
};
module.exports.updateLastLeaderboardClaimToday = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE user
    SET last_leaderboard_claim = CURDATE()
    WHERE user_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};



