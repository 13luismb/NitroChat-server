const express = require('express');
const passport = require('passport');
const auth = require('./../middlewares/jwtAuth');
const jwt = require('jsonwebtoken');
let router = express.Router();
const User = require('./../helpers/users');
const upload = require('./../helpers/uploads');
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
    const resp = await User.updateProfile(req, req.body.username, req.body.email, req.body.name , req.body.phone);
    if (resp.status === 200){
        const preUser = {...req.user};
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
                user: {
                      users_id: preUser.users_id,
                      users_phone: req.user.phone
                    , users_username: req.user.username
                    , users_name: req.user.name
                    , users_email: req.user.email
                    , user_picture_url: preUser.user_picture_url
                    , users_creation_time: preUser.users_creation_time}
            });
    });
    }
});

router.post('/updatePicture', auth, upload.single('image'), async (req,res) => {
    try{
        const resp = await User.updateProfilePicture(req);
        if(resp.status ===200){
            const user = req.user;
            //console.log('este es el user', req.user);
            req.logIn(user, { session: false }, function(err) {
                if (err) {
                    return res.status(500).send({
                        err: 'Could not log in user'
                    });
                }

                let jsonWebToken = jwt.sign(user, config.secret);
            res.status(resp.status).send({...resp, token: jsonWebToken});
            });
        } else{
            res.status(401).send({});
        }
    }catch(e){
        console.log(e);
        res.send(e);
    }
});

router.get('/searchAll', auth, async (req, res) => {
    try{
        const resp = await User.searchUser(null);
        res.status(resp.status).send(resp);
    }catch(e){
        res.send(e);
    }
});


router.get('/search/:name', auth, async (req, res) => {
    try{
        const resp = await User.searchUser(req.params.name);
        res.status(resp.status).send(resp);
    }catch(e){
        res.send(e);
    }
});


module.exports = router;
