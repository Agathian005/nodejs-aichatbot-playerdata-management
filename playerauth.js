const express = require('express');
const app = express();
const router = express.Router();
const playerlogging = require('../controllersformyapi/playerauthcontroller');

router.post('/',playerlogging.playerlogin);

module.exports = router;