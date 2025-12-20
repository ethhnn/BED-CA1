//ethanchuwa03.25@ichat.sp.edu.sg p2508638 DAAA/FT/1B/04

const express = require('express');
const router = express.Router();

const challengesRoutes = require('./challengesRoutes');
router.use("/challenges", challengesRoutes);

const usersRoutes = require('./usersRoutes');
router.use("/users", usersRoutes);

const creatureRoutes = require('./creatureRoutes');
router.use("/creature", creatureRoutes);

const shopRoutes = require('./shopRoutes');
router.use("/shop", shopRoutes);


module.exports = router;