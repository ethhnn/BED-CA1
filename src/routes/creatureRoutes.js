const express = require('express');
const router = express.Router();

const creatureController = require('../controllers/creatureController');

router.get('/:user_id',
    creatureController.getActiveCreatureById
)
router.get('/all/:user_id',
    creatureController.getAllCreaturesByUserId
)
router.post("/start",
  creatureController.validateStartCreature,
  creatureController.checkUserExists,
  creatureController.checkUserHasNoCreature,
  creatureController.createStarterCreature
);


//add evolve


module.exports = router;