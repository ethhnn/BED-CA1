const shopModel = require("../models/shopModel");
const userModel = require("../models/userModel");
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

  userModel.selectUserByIdWithPoints(data, callback);
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

    req.item = results[0]; // contains cost_points
    next();
  };

  shopModel.selectShopItemById(data, callback);
};
module.exports.checkSufficientPoints = (req, res, next) => {
  const qty = req.body.quantity ? Number(req.body.quantity) : 1;
  const totalCost = Number(req.item.cost_points) * qty;

  if (Number(req.user.points) < totalCost) {
    return res.status(409).json({
      message: "Insufficient points."
    });
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