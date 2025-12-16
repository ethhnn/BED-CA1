const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/',
    userController.checkIfUserExists,
    userController.createNewUser
); //Endpoint 1
router.get('/',
    userController.getAllUser
); //Endpoint 2
router.get("/:user_id", 
    userController.checkUserExists,
    userController.getUserById
); //Endpoint 3
router.put("/:user_id",
    userController.checkUserExists,
    userController.checkIfUserExists,
    userController.updateUserById
); //Endpoint 4
module.exports = router;