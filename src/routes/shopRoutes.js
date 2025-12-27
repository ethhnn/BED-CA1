const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// =====================
// FIXED ROUTES
// =====================

router.get("/items",
  shopController.getAllShopItems //200
);

router.post("/buy",
  shopController.validateBuyBody,// 400
  shopController.checkUserExists,// 404
  shopController.checkShopItemExists,// 404
  shopController.checkActiveCreatureBenefit,// 404
  shopController.applyAquafinDiscount,
  shopController.checkSufficientPoints,// 409
  shopController.deductUserPoints,
  shopController.checkInventoryRow,
  shopController.insertOrUpdateInventory,
  shopController.sendBuySuccess//200
);

module.exports = router;