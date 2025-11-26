const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
//place longer on top
router.get('/:id', userController.readUserById);//Basic Ex task 2//note get has no body
router.get('/', userController.readAllUser);//basic ex task 1//note get has no body

// router.post('/', userController.createNewUser);//basic ex task 3 version1(not recomended)
router.post('/', userController.createNewUserMiddleware,userController.displayNewUser);//basic ex task 3 version2. preference for use of middleware
router.put('/:id', userController.updateUserById);//basic ex task 4
router.delete('/:id', userController.deleteUserById); //note delete does not have body // task 5


//":id" is a path parameter. These are part of URL and will be checked for by router when they are in use
module.exports = router;//do note miss out this line