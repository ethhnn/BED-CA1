const userCompletionModel = require("../models/userCompletionModel.js");
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
module.exports.addPoints = (req, res,next) =>{
    const { user_id,details } = req.body;
    const data = {
        points:req.points,
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
module.exports.sendStatus =(req,res) =>{
    const { user_id,details } = req.body;
    return res.status(201).json({
                    "complete_id":req.completion_id,
                    "challenge_id":req.params.challenge_id,
                    "user_id": user_id,
                    "details":details
                });
}
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