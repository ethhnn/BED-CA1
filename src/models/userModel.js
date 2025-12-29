const pool = require('../services/db');

// Check if a username already exists
module.exports.checkIfUserExists = (data, callback) =>
{ 
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE username = ?;
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Create a new user with default points
module.exports.createNewUser = (data, callback) =>
{
    const SQLSTATEMENT = `
    INSERT INTO user (username)
    VALUES (?);
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Retrieve all users
module.exports.getAllUser = (callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM user
    `;
    pool.query(SQLSTATEMENT, callback);
}

// Check if a user exists by user_id
module.exports.checkUserExists = (data, callback) =>
{ 
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Retrieve a single user by ID
module.exports.getUserById = (data,callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?
    `;
    const VALUES = [data.user_id]
    pool.query(SQLSTATEMENT,VALUES, callback);
}

// Update username and points for a user
module.exports.updateUserById = (data,callback) =>{
    const SQLSTATEMENT = `
    UPDATE user 
    SET username = ?, points =? 
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.points, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Deduct points from a user
module.exports.deductPoints = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE user
    SET points = points - ?
    WHERE user_id = ?;
  `;
  const VALUES = [data.cost, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve top 3 users by points
module.exports.selectTop3UsersByPoints = (callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, points
    FROM user
    ORDER BY points DESC, user_id ASC
    LIMIT 3;
  `;
  pool.query(SQLSTATEMENT, [], callback);
};

// Add item to user inventory
// If item exists, increase quantity by 1
module.exports.addItemToInventoryUpsert = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserInventory (user_id, item_id, quantity)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE quantity = quantity + 1;
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.item_id], callback);
};

// Update last leaderboard claim date (once per day logic)
module.exports.updateLastLeaderboardClaimToday = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE user
    SET last_leaderboard_claim = CURDATE()
    WHERE user_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// Retrieve inventory items for a user
module.exports.getInventoryByUser = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
      ui.inventory_id,
      ui.user_id,
      ui.item_id,
      si.name,
      si.description,
      ui.quantity
    FROM UserInventory ui
    INNER JOIN ShopItem si
      ON ui.item_id = si.item_id
    WHERE ui.user_id = ?
    ORDER BY si.name ASC;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve top N users (dynamic leaderboard size)
module.exports.selectTopUsers = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
      user_id,
      username,
      points
    FROM User
    ORDER BY points DESC, user_id ASC
    LIMIT ?;
  `;
  const VALUES = [data.limit];

  pool.query(SQLSTATEMENT, VALUES, callback);
};


