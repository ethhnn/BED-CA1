//ethanchuwa03.25@ichat.sp.edu.sg p2508638 DAAA/FT/1B/04

const express = require('express');
const router = express.Router();

//Better to comment out unused routes instead of deleting them


const challengesRoutes = require('./challengesRoutes');
router.use("/challenges", challengesRoutes);

const usersRoutes = require('./usersRoutes');
router.use("/users", usersRoutes);

module.exports = router;