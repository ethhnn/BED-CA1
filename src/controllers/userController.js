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