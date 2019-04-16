const express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
const User = require('./../helpers/users');


router.post('/register', async (req, res) => {
    const newUser = await User.getUserByPhone(req.body.username, req.body.phone, req.body.email);
    console.log(newUser);
    if (newUser.exists){
        res.status(403).send({
            status:403,
            reason: newUser.reason
        })
    }else{
        User.registerUser(req.body.phone, req.body.username,
            bcrypt.hashSync(req.body.password, 10),
            req.body.name,
            req.body.email)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.send(err);
        })
    }
});

module.exports = router;