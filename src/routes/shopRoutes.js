const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// =====================
// FIXED ROUTES
// =====================

router.get("/items",
  shopController.getAllShopItems
);

router.post("/buy",
  shopController.validateBuyBody,            // 400
  shopController.checkUserExists,            // 404
  shopController.checkShopItemExists,        // 404
  shopController.checkActiveCreatureBenefit, // 404 (sets req.activeCreatureBenefit)
  shopController.applyAquafinDiscount,
  shopController.checkSufficientPoints,      // 409
  shopController.deductUserPoints,
  shopController.checkInventoryRow,
  shopController.insertOrUpdateInventory,
  shopController.sendBuySuccess
);

module.exports = router;