const express = require('express');
const passport = require('passport');
const auth = require('./../middlewares/jwtAuth');
const jwt = require('jsonwebtoken');
let router = express.Router();
const User = require('./../helpers/users');
const Chat = require('./../helpers/conversation');
const multer = require('./../helpers/multer');
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
        let user = req.user;
        let body = req.body;
       /* const preUser = {...req.user};
        const user = req.body;*/
        user.users_username = body.username;
        user.users_name = body.name;
        user.users_email = body.email;
        user.users_phone = body.phone;
        console.log(user);
        req.logIn(user, { session: false }, function(err) {
            if (err) {
                console.log('toy aqui');
                return res.status(500).send({
                    err: 'Could not log in user'
                });
            }
            let jsonWebToken = jwt.sign(user, config.secret);
            res.status(200).send({
                status: 200,
                message: 'ok',
                token: jsonWebToken,
                user: user /*{
                      users_id: preUser.users_id,
                      users_phone: req.user.phone
                    , users_username: req.user.username
                    , users_name: req.user.name
                    , users_email: req.user.email
                    , user_picture_url: preUser.user_picture_url
                    , users_creation_time: preUser.users_creation_time}
            */});
    });
    }
});

router.post('/updatePicture', auth, multer.single('image'), async (req,res) => {
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

router.post('/searchAll', auth, async (req, res) => {
    try{
        const contacts = [...req.body.data];
        const resp = await User.searchUser(null);
        let userList = { users: [], notUsers: []};
        let resultFind;
        for (let contact of contacts){
            let newNumber = contact._objectInstance.phoneNumbers[0].value
                    .replace(' ', '').replace('+', '').replace('(','').replace(')', '').replace('-','')
                if(newNumber.startsWith('58')){
                    newNumber = newNumber.replace('58', '');
                }
                if(newNumber.startsWith('0')){
                    newNumber = newNumber.replace('0', '');
                }
                let newUser = { displayName: contact._objectInstance.displayName,
                    phoneNumber: newNumber};
               resultFind = resp.data.find(el => {return el.users_phone === newUser.phoneNumber});
            if(resultFind){
                let chat = await Chat.interpolateChats(req.user.users_id, resultFind.users_id);
                if(chat.res) newUser.chatId = chat.chatId;
                newUser.id = resultFind.users_id;
                newUser.picture_url = resultFind.user_picture_url;
                userList.users.push(newUser);
            }else {
                userList.notUsers.push(newUser);
            }
        }
        console.log(userList);
        res.status(resp.status).send(userList);
    }catch(e){
        res.send(e);
    }
});


// router.post('/search', auth, async (req, res) => {
//     try{
//         const contacts = [...req.body.data];
//         const resp = await User.searchUser(req.body.name);
//         let userList = { users: [], notUsers: []};
//         let resultFind;
//         for(let contact of contacts){
//             let newNumber = contact._objectInstance.phoneNumbers[0].value
//                 .replace(' ', '').replace('+', '').replace('(','').replace(')', '').replace('-','')
//             if(newNumber.startsWith('58')){
//                 newNumber = newNumber.replace('58', '');
//             }
//             if(newNumber.startsWith('0')){
//                 newNumber = newNumber.replace('0', '');
//             }
//             let newUser = { displayName: contact._objectInstance.displayName,
//                 phoneNumber: newNumber};
//             resultFind = resp.data.find(el => {return el.users_phone === newUser.phoneNumber});
//             if(resultFind){
//                 newUser.id = resultFind.users_id;
//                 newUser.picture_url = resultFind.user_picture_url;
//                 userList.users.push(newUser);
//             }else {
//                 userList.notUsers.push(newUser);
//             }
//         }
//
//         res.status(resp.status).send(userList);
//     }catch(e){
//         res.send(e);
//     }
// });


module.exports = router;
