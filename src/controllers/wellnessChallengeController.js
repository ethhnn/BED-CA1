const wellnessChallengeModel = require("../models/wellnessChallengeModel.js");

// Create a new wellness challenge
module.exports.createNewChallenge = (req, res) => {
    const { description,user_id,points } = req.body;
    // Basic body validation
    if (description == null || user_id == null || points == null) {
        return res.status(400).json({ message: "Missing Description or user ID or Points." });
    }
    const data = {description,user_id,points};

    const callback = (error, results) => {
        if (error) {
            console.error("Error createNewChallenge:", error);
            return res.status(500).json({message: "Internal server error"});
        }
        else{
            // Return created challenge
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

// Retrieve all challenges
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

// Delete a challenge by ID
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
            // affectedRows = 0 means nothing deleted
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

// Validates body + checks challenge exists + checks ownership
module.exports.errorChecks = (req,res,next) =>{
    const { user_id,description,points } = req.body;
    // Body validation for update
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
            // If challenge_id doesn't exist
            if (results.length === 0) {
                return res.status(404).json({ message: "Challenge Id not found" });
            }
            // Owner check
            if (results[0].creator_id !== req.body.user_id){
                return res.status(403).json({ message: "Not the Owner of this Challenge" });
            }
                // Store creator_id for use in the next handler
                req.creator_id = results[0].creator_id;
                next()
            
        }
        wellnessChallengeModel.errorChecks(data, callback);
}

// Update challenge description + points
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