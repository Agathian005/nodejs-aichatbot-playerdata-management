const express = require('express');
const router = express.Router();
const playerreg = require('../controllersformyapi/playerregcontroller');

router.post('/',playerreg.handlenewplayer);

module.exports = router;