const shopModel = require("../models/shopModel");
const userModel = require("../models/userModel");
const creatureModel = require("../models/creatureModel");
module.exports.validateBuyBody = (req, res, next) => {
  const { user_id, item_id, quantity } = req.body;

  if (!user_id || !item_id) {
    return res.status(400).json({ message: "user_id and item_id are required." });
  }
  if (isNaN(user_id) || isNaN(item_id)) {
    return res.status(400).json({ message: "user_id and item_id must be numbers." });
  }

  if (quantity !== undefined && (isNaN(quantity) || Number(quantity) <= 0)) {
    return res.status(400).json({ message: "quantity must be a positive number." });
  }

  next();
};
module.exports.checkUserExists = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkUserExists:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = results[0];
    next();
  };

  userModel.getUserById(data, callback);
};
module.exports.checkShopItemExists = (req, res, next) => {
  const data = { item_id: req.body.item_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkShopItemExists:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Shop item not found." });
    }

    req.itemCost = results[0].cost_points;
    req.item = results[0];
    next();
  };

  shopModel.selectShopItemById(data, callback);
};
module.exports.checkSufficientPoints = (req, res, next) => {
  const qty = req.body.quantity ? Number(req.body.quantity) : 1;

  const unitCost = (req.finalUnitCost ?? Number(req.item.cost_points));

  const totalCost = unitCost * qty;

  if (Number(req.user.points) < totalCost) {
    return res.status(409).json({ message: "Insufficient points." });
  }

  req.totalCost = totalCost;
  req.qty = qty;
  next();
};
module.exports.deductUserPoints = (req, res, next) => {
  const data = {
    user_id: req.body.user_id,
    cost: req.totalCost
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error deductUserPoints:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  userModel.deductPoints(data, callback);
};
module.exports.checkInventoryRow = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        item_id: req.body.item_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checkInventoryRow:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        // store for next middleware
        req.inventoryRow = results;      // [] or [row]
        next();
    };

    shopModel.selectInventoryRow(data, callback);
};
module.exports.insertOrUpdateInventory = (req, res, next) => {
    const qty = req.qty ? req.qty : 1;

    const data = {
        user_id: req.body.user_id,
        item_id: req.body.item_id,
        quantity: qty
    };

    // if no row -> insert
    if (req.inventoryRow.length === 0) {
        const callback = (error, results) => {
            if (error) {
                console.error("Error insertInventoryRow:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
            next();
        };

        return shopModel.insertInventoryRow(data, callback);
    }

    // else -> update qty
    const callback = (error, results) => {
        if (error) {
            console.error("Error updateInventoryQty:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        next();
    };

    shopModel.updateInventoryQty(data, callback);
};
module.exports.sendBuySuccess = (req, res) => {
    return res.status(200).json({
        message: "Purchase successful.",
        spent_points: req.totalCost
    });
};
module.exports.checkActiveCreatureBenefit = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkActiveCreatureBenefit:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Active creature not found." });
    }

    // store for next middleware
    req.activeCreature = results[0];
    next();
  };

  creatureModel.selectActiveCreatureBenefitByUserId(data, callback);
};
module.exports.applyAquafinDiscount = (req, res, next) => {
  const baseCost = Number(req.itemCost); // must be set by checkShopItemExists
  req.finalUnitCost = baseCost;              // default: no discount

  if (!req.activeCreature) return next(); // safety

  const benefitType = req.activeCreature.benefit_type;
  const stage = Number(req.activeCreature.stage);
  const stage2Value = Number(req.activeCreature.stage2_value);
  const stage3Value = Number(req.activeCreature.stage3_value);

  // Stage 1: no benefit
  if (stage === 1) return next();

  // Only Aquafin benefit applies here
  if (benefitType !== "SHOP_DISCOUNT") return next();

  const discount = (stage === 2) ? stage2Value : stage3Value;

  req.finalUnitCost = Math.max(0, baseCost - discount);
  next();
};