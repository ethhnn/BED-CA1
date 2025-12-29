const userCompletionModel = require("../models/userCompletionModel.js");
const creatureModel = require("../models/creatureModel");

// Middleware: check user exists (body user_id)
module.exports.checkUserExists = (req, res, next) =>
{
    const { user_id,details } = req.body;
    const data = {
        challenge_id: req.params.challenge_id,
        user_id,
        details
    };
    const callback = (error, results) => {
        if (error) {
            console.error("Error checkChallengeExists:", error);
            return res.status(500).json({message: "Internal server error"});
        } else {
            if(results.length == 0) 
            {
                return res.status(404).json({
                    "message": "User Does Not Exist."
                });
            }
            else{
                next();
            }
        }
    }

    userCompletionModel.checkUserExists(data, callback);
};

// Middleware: check challenge exists and store challenge points on req
module.exports.checkChallengeExistsAndExtractPoints= (req, res,next) =>{
    const { user_id,details } = req.body;
    const data = {
        challenge_id: req.params.challenge_id,
        user_id,
        details
    };
    const callback = (error, results) => {
            if (error) {
                console.error("Error checkChallengeExistsAndExtractPoints:", error);
                return res.status(500).json({message: "Internal server error"});
            }
            else if(results.length === 0){
                return res.status(404).json({ message: "Challenge Does Not Exist." });
            }
            else{
                req.points= results[0].points
                next()
            }
    } 
    userCompletionModel.checkChallengeExistsAndExtractPoints(data, callback);
}

// Middleware: create completion record and store completion_id on req
module.exports.createCompletionRecord = (req, res,next) =>{ 
    const { user_id,details } = req.body;
    const data = {
        challenge_id: req.params.challenge_id,
        user_id,
        details
    };
    
        const callback = (error, results) => {
            if (error) {
                console.error("Error createCompletionRecord:", error);
                return res.status(500).json({message: "Internal server error"});
            }
            else{
                req.completion_id = results.insertId;
                next()
            }
    
        };
    
        userCompletionModel.createCompletionRecord(data, callback);
}

// Middleware: add points to user (uses creature bonus if present)
module.exports.addPoints = (req, res,next) =>{
    const { user_id,details } = req.body;
    const data = {
        points:req.finalPoints ?? req.points,
        challenge_id: req.params.challenge_id,
        user_id,
        details
    };
    const callback = (error, results) => {
            if (error) {
                console.error("Error addPoints:", error);
                return res.status(500).json({message: "Internal server error"});
            }
            else{
                next()
            }
    }

    userCompletionModel.addPoints(data, callback);
}

// Final handler for POST completion route
module.exports.sendStatus =(req,res) =>{
    const { user_id,details } = req.body;
    return res.status(201).json({
                    "complete_id":req.completion_id,
                    "challenge_id":req.params.challenge_id,
                    "user_id": user_id,
                    "details":details
                });
}

// Middleware: check for attempts
module.exports.checkAttempts = (req, res, next) => {
    const data = {
        challenge_id: req.params.challenge_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checkAttempts:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "No user attempts found for this challenge."
            });
        }

        next();
    };

    userCompletionModel.checkAttempts(data, callback);
};

//Gets challenge by Id
module.exports.getChallengeById = (req, res) => {
    const data = {
        challenge_id: req.params.challenge_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error getChallengeById:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        return res.status(200).json(results);
    };

    userCompletionModel.getChallengeById(data, callback);
};

// Middleware: delete completions for a challenge
module.exports.deleteCompletionById = (req,res,next) =>
{
    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error deleteCompletionById:", error);
            return res.status(500).json({message: "Internal server error"});
        }
        else next()      
        
    }

    userCompletionModel.deleteCompletionById(data, callback);
};

// Middleware: get active creature benefit info and store on req
module.exports.checkActiveCreatureAndExtractBenefit = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkActiveCreatureAndExtractBenefit:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // If your game guarantees an active creature exists, keep this 404.
    if (results.length === 0) {
      return res.status(404).json({ message: "Active creature not found." });
    }

    // store on req for later middlewares
    req.activeCreature = results[0];
    // expected fields: stage, benefit_type, stage2_value, stage3_value, creature_name (optional)
    next();
  };

  creatureModel.selectActiveCreatureBenefitByUserId(data, callback);
};

// Middleware: apply creature benefit to points
module.exports.applyCreatureBenefitToPoints = (req, res, next) => {
  const basePoints = Number(req.points);
  const stage = Number(req.activeCreature.stage);

  // default: no benefit
  req.finalPoints = basePoints;
  req.benefitApplied = { benefit_type: "NONE", value: 0 };

  // stage 1 has no benefit
  if (stage === 1) return next();

  const benefitType = req.activeCreature.benefit_type;
  const stage2Value = Number(req.activeCreature.stage2_value);
  const stage3Value = Number(req.activeCreature.stage3_value);

  // pick stage value
  const stageValue = (stage === 2) ? stage2Value : stage3Value;

  // Shop discount applies only to shop endpoint
  if (benefitType === "SHOP_DISCOUNT") return next();

  // Sproutling style: flat bonus
  if (benefitType === "CHALLENGE_BONUS") {
    req.finalPoints = basePoints + stageValue;
    req.benefitApplied = { benefit_type: benefitType, value: stageValue };
    return next();
  }

  // Flameling style: percent multiplier stored as INT (e.g. 20 = +20%)
  if (benefitType === "CHALLENGE_MULTIPLIER") {
    const percent = stageValue;
    req.finalPoints = Math.round(basePoints * (1 + percent / 100));
    req.benefitApplied = { benefit_type: benefitType, value: percent };
    return next();
  }

  // Zephyra style: crit chance stored as INT % (e.g. 20 = 20%)
  if (benefitType === "CHALLENGE_CRIT_CHANCE") {
    const chance = stageValue;
    const bonus = (stage === 2) ? 10 : 20;

    if (Math.random() < chance / 100) {
      req.finalPoints = basePoints + bonus;
      req.benefitApplied = { benefit_type: benefitType, value: `${chance}% (+${bonus})` };
    } else {
      req.finalPoints = basePoints;
      req.benefitApplied = { benefit_type: benefitType, value: `${chance}% (no crit)` };
    }
    return next();
  }

  // Terranox style: milestone every N completions
  if (benefitType === "CHALLENGE_MILESTONE") {
    const data = { user_id: req.body.user_id };

    const callbackCount = (error, results) => {
      if (error) {
        console.error("Error countUserCompletionsByUserId:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      const currentCount = Number(results[0].total);  // before insert
      const afterInsertCount = currentCount + 1;      // this completion will be next

      const N = stageValue;
      const bonus = (stage === 2) ? 20 : 30;

      if (N > 0 && afterInsertCount % N === 0) {
        req.finalPoints = basePoints + bonus;
        req.benefitApplied = { benefit_type: benefitType, value: `every ${N} (+${bonus})` };
      } else {
        req.finalPoints = basePoints;
        req.benefitApplied = { benefit_type: benefitType, value: `every ${N} (no bonus)` };
      }

      next();
    };

    return creatureModel.countUserCompletionsByUserId(data, callbackCount);
  }

  // unknown benefit type -> ignore safely
  return next();
};

// Middleware: increment evo counter after completion
module.exports.incrementEvoChallengeCount = (req, res, next) => {
  const data = { user_id: req.body.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error incrementEvoChallengeCount:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    next();
  };

  creatureModel.incrementEvoChallengeCount(data, callback);
};

// Retrieve completion history for a user
module.exports.getCompletionsByUserId = (req, res) => {
  const data = { user_id: req.params.user_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error getCompletionsByUserId:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No completion history found for this user." });
    }

    return res.status(200).json(results);
  };

  userCompletionModel.getCompletionsByUserId(data, callback);
};