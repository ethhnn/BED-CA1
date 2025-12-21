const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.post("/buy",
  shopController.validateBuyBody,      // 400
  shopController.checkUserExists,      // 404
  shopController.checkShopItemExists,  // 404
  shopController.checkSufficientPoints,// 409
  shopController.deductUserPoints,     // next()
  shopController.checkInventoryRow,
  shopController.insertOrUpdateInventory,
  shopController.sendBuySuccess
);

module.exports = router;