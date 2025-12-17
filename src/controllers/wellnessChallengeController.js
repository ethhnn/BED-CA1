const wellnessChallengeModel = require("../models/wellnessChallengeModel.js");

module.exports.createNewChallenge = (req, res) => {
    const { description,user_id,points } = req.body;
    if (description == null || user_id == null) {
        return res.status(400).json({ message: "Missing Description or user ID." });
    }
    const data = {description,user_id,points};

    const callback = (error, results) => {
        if (error) {
            console.error("Error createNewChallenge:", error);
            return res.status(500).json({message: "Internal server error"});
        }
        else{
            res.status(201).json({
                "challenge_id":results.insertId,
                "description":description,
                "creator_id": user_id,
                "points":points
            });
        }

    };

    wellnessChallengeModel.createNewChallenge(data, callback);
};
module.exports.getAllChallenges =(req,res)=>{ 
    const callback = (error, results) => {
        if (error) {
            console.error("Error getAllChallenges:", error);
            return res.status(500).json({message: "Internal server error"});
        }else{
            res.status(200).json(results);
        }
    }

    wellnessChallengeModel.getAllChallenges(callback);
};
module.exports.deleteChallengeById = (req,res) =>
{
    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error deleteChallengeById:", error);
            return res.status(500).json({message: "Internal server error"});
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "Challenge not found."
                });
            }
            else res.status(204).send();       
        }
    }

    wellnessChallengeModel.deleteChallengeById(data, callback);
};
module.exports.checkOwner = (req,res,next) =>{
    const { user_id,description,points } = req.body;
    if (user_id == null || description == null || points==null) {
        return res.status(400).json({ message: "Missing Description, user ID or points." });
    }
    const data = {
            challenge_id: req.params.challenge_id,
            user_id,
            description,
            points
        }
        const callback = (error, results) => {
            if (error) {
                console.error("Error checkOwner:", error);
                return res.status(500).json({message: "Internal server error"});
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Challenge Id not found" });
            }
            if (results[0].creator_id !== req.body.user_id){
                return res.status(403).json({ message: "Not the Owner of this Challenge" });
            }
                req.creator_id = results[0].creator_id;
                next()
            
        }
        wellnessChallengeModel.checkOwner(data, callback);
}
module.exports.updateChallengeById = (req,res) =>{
    const { user_id,description,points } = req.body;
        const data = {
            challenge_id: req.params.challenge_id,
            user_id,
            description,
            points
        }
    
        const callback = (error, results) => {
            if (error) {
                console.error("Error updateChallengeById:", error);
                return res.status(500).json({message: "Internal server error"});
            }
            else res.status(200).json({
                "challenge_id":Number(req.params.challenge_id),
                "description":description,
                "creator_id":req.creator_id,
                "points":points
            });
            }
    
        wellnessChallengeModel.updateChallengeById(data, callback);
}