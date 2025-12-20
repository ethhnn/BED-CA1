const creatureModel = require("../models/creatureModel");
const userModel = require("../models/userModel");
module.exports.getActiveCreatureById = (req, res) => {
    const data = {
        user_id: req.params.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error getActiveCreatureById:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Active creature not found."
            });
        }

        return res.status(200).json(results[0]);
    };

    creatureModel.getActiveCreatureByUserId(data, callback);
};
module.exports.getAllCreaturesByUserId = (req, res) => {
    const data = {
        user_id: req.params.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error getAllCreaturesByUserId:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
        return res.status(200).json(results);
    };

    creatureModel.getAllCreaturesByUserId(data, callback);
};
module.exports.validateStartCreature = (req, res, next) => {
  const { user_id, creature_id } = req.body;

  if (!user_id || !creature_id) {
    return res.status(400).json({
      message: "user_id and creature_id are required."
    });
  }

  if (isNaN(user_id) || isNaN(creature_id)) {
    return res.status(400).json({
      message: "user_id and creature_id must be numbers."
    });
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
      return res.status(404).json({
        message: "User not found."
      });
    }

    next();
  };

  userModel.getUserById(data, callback);
};
module.exports.checkUserHasNoCreature = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkUserHasNoCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "User already has a creature."
      });
    }

    next();
  };

  creatureModel.getCreaturesByUserId(data, callback);
};
module.exports.createStarterCreature = (req, res) => {
  const data = {
    user_id: req.body.user_id,
    creature_id: req.body.creature_id
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error createStarterCreature:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(201).json({
      message: "Starter creature created successfully."
    });
  };

  creatureModel.insertStarterCreature(data, callback);
};
