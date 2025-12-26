const userModel = require("../models/userModel.js");


module.exports.checkIfUserExists = (req, res, next) =>
{
    const { username } = req.body;
    if (username == null) {
        return res.status(400).json({ message: "Missing username." });
    }
    const data = {username};

    const callback = (error, results) => {
        if (error) {
            console.error("Error checkIfUserExists:", error);
            res.status(500).json(error);
        } else {
            if(results.length > 0) 
            {
                res.status(409).json({
                    "message": "User Already Exist."
                });
            }
            else{
                next();
            }
        }
    }

    userModel.checkIfUserExists(data, callback);
};
module.exports.createNewUser = (req, res) => {
    const { username } = req.body;

    const data = {username};

    const callback = (error, results) => {
        if (error) {
            console.error("Error createNewUser:", error);
            return res.status(500).json({message: "Internal server error"});
        }
        else{
            res.status(201).json({
                "user_id":results.insertId,
                "username":username,
                "points": 0
            });
        }

    };

    userModel.createNewUser(data, callback);
};
module.exports.getAllUser =(req,res)=>{ 
    const callback = (error, results) => {
        if (error) {
            console.error("Error getAllUser:", error);
            return res.status(500).json({message: "Internal server error"});
        }else{
            res.status(200).json(results);
        }
    }

    userModel.getAllUser(callback);
};
module.exports.checkUserExists = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }
    const callback = (error, results) => {
        if (error) {
            console.error("Error checkUserExists:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    "message": "User Does Not Exist."
                });
            }
            else{
                next();
            }
        }
    }

    userModel.checkUserExists(data, callback);
};
module.exports.getUserById =(req,res)=>{ 
    const data = {
        user_id: req.params.user_id
    }
    const callback = (error, results) => {
        if (error) {
            console.error("Error getUserById:", error);
            return res.status(500).json({message: "Internal server error"});
        }else{
            res.status(200).json(results);
        }
    }

    userModel.getUserById(data,callback);
};
module.exports.updateUserById = (req, res) =>
{
    const { username,points } = req.body;
    const data = {
        user_id: req.params.user_id,
        username,
        points
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error updateUserById:", error);
            return res.status(500).json({message: "Internal server error"});
        }
        else res.status(200).json({
            "user_id":req.params.user_id,
            "username":username,
            "points":points
        });
        }

    userModel.updateUserById(data, callback);
}

module.exports.validateClaimBody = (req, res, next) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required." });
  }
  if (isNaN(user_id)) {
    return res.status(400).json({ message: "user_id must be a number." });
  }

  next();
};
module.exports.checkUserExistsBody = (req, res, next) =>
{
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkUserExistsBody:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User Does Not Exist." });
    }

    req.user = results[0];
    next();
  };

  userModel.checkUserExists(data, callback);
};
module.exports.checkNotClaimedToday = (req, res, next) => {
  
  const lastClaim = req.user.last_leaderboard_claim;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (lastClaim && String(lastClaim).slice(0, 10) === todayStr) {
    return res.status(409).json({ message: "You have already claimed today's reward." });
  }

  next();
};
module.exports.getTop3Users = (req, res, next) => {
  const callback = (error, results) => {
    if (error) {
      console.error("Error getTop3Users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // results: [{user_id, points}, ...]
    const top3 = results.map(r => Number(r.user_id));
    const uid = Number(req.body.user_id);

    const rankIndex = top3.indexOf(uid); // 0,1,2 or -1
    if (rankIndex === -1) {
      return res.status(403).json({ message: "You are not in today's top 3." });
    }

    // rank mapping: #1 -> item 3, #2 -> item 2, #3 -> item 1
    const itemMap = [3, 2, 1];
    req.rank = rankIndex + 1;
    req.rewardItemId = itemMap[rankIndex];

    next();
  };

  userModel.selectTop3UsersByPoints(callback);
};
module.exports.giveLeaderboardItem = (req, res, next) => {
  const data = {
    user_id: req.body.user_id,
    item_id: req.rewardItemId
  };

  const callback = (error, results) => {
    if (error) {
      console.error("Error giveLeaderboardItem:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  userModel.addItemToInventoryUpsert(data, callback);
};
module.exports.markClaimedToday = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error markClaimedToday:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  userModel.updateLastLeaderboardClaimToday(data, callback);
};
module.exports.sendClaimSuccess = (req, res) => {
  return res.status(200).json({
    message: "Reward claimed.",
    rank: req.rank,
    item_id: req.rewardItemId
  });
};


module.exports.getInventoryByUser = (req, res) => {
  const data = { user_id: req.params.user_id };

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Inventory is empty." });
    }
    res.status(200).json(results);
  };

  userModel.getInventoryByUser(data, callback);
};
module.exports.getTop10Users = (req, res) => {
  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json(results);
  };

  userModel.selectTopUsers({ limit: 10 }, callback);
};