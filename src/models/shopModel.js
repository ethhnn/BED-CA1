const pool = require("../services/db");

// Retrieve a shop item by item_id
// Used to check item existence and cost before purchase
module.exports.selectShopItemById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT item_id, cost_points
    FROM ShopItem
    WHERE item_id = ?;
  `;
  const VALUES = [data.item_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Check if a user already owns the item
module.exports.selectInventoryRow = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT inventory_id, quantity
        FROM UserInventory
        WHERE user_id = ? AND item_id = ?;
    `;
    const VALUES = [data.user_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Insert a new inventory record
module.exports.insertInventoryRow = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserInventory (user_id, item_id, quantity)
        VALUES (?, ?, ?);
    `;
    const VALUES = [data.user_id, data.item_id, data.quantity];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update inventory quantity
module.exports.updateInventoryQty = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserInventory
        SET quantity = quantity + ?
        WHERE user_id = ? AND item_id = ?;
    `;
    const VALUES = [data.quantity, data.user_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve all shop items
module.exports.getAllShopItems = (callback) => {
  const SQLSTATEMENT = `
    SELECT
      item_id,
      name,
      description,
      cost_points,
      satisfaction_gain
    FROM ShopItem;
  `;
  pool.query(SQLSTATEMENT, callback);
};