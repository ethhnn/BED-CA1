const pool = require("../services/db");

module.exports.selectShopItemById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT item_id, cost_points
    FROM ShopItem
    WHERE item_id = ?;
  `;
  const VALUES = [data.item_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};
module.exports.selectInventoryRow = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT inventory_id, quantity
        FROM UserInventory
        WHERE user_id = ? AND item_id = ?;
    `;
    const VALUES = [data.user_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.insertInventoryRow = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserInventory (user_id, item_id, quantity)
        VALUES (?, ?, ?);
    `;
    const VALUES = [data.user_id, data.item_id, data.quantity];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.updateInventoryQty = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserInventory
        SET quantity = quantity + ?
        WHERE user_id = ? AND item_id = ?;
    `;
    const VALUES = [data.quantity, data.user_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};