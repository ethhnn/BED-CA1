const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//place longer on top
router.post('/',userController.anySuitableFunctionName); //Endpoint 1
module.exports = router;