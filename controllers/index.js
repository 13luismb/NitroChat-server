const express = require('express');
let router = express.Router();

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

router.use(require('./session'));
router.use(require('./register'));
router.use(require('./conversation'));
router.use(require('./message'));


module.exports = router;
