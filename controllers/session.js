const express = require('express');
const passport = require('passport');
const auth = require('./../middlewares/jwtAuth');
const jwt = require('jsonwebtoken');
let router = express.Router();
const User = require('./../helpers/users');
const config = require('./../helpers/config');

router.post('/login', function(req, res, next) {
    passport.authenticate('local', { session: false }, function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({
                err: info
            });
        }
        req.logIn(user, { session: false }, function(err) {
            if (err) {
                return res.status(500).send({
                    err: 'Could not log in user'
                });
            }

            let jsonWebToken = jwt.sign(user, config.secret);
            res.status(200).send({
                status: 200,
                message: 'Login Successful',
                token: jsonWebToken,
                user: user
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).send({
        status: 'Bye!'
    });
});

router.put('/updateProfile', async (req,res)=>{
    const resp = await User.updateProfile(req, req.body.username, req.body.name, req.body.email, req.body.phone);
    if (resp.status === 200){
        const user = req.body;
        req.logIn(user, { session: false }, function(err) {
            if (err) {
                return res.status(500).send({
                    err: 'Could not log in user'
                });
            }

            let jsonWebToken = jwt.sign(user, config.secret);
            res.status(200).send({
                status: 200,
                message: 'ok',
                token: jsonWebToken,
                user: req.user
            });
    });
    }
});

router.post('/updatePicture', async (req,res) => {
    await User.setPhoto(req,res);
});



module.exports = router;