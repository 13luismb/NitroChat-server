const express = require('express');
let router = express.Router();

router.use(require('./session'));
router.use(require('./register'));

module.exports = router;