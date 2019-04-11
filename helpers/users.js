const db = require('./db');
const bcrypt = require('bcryptjs');
const sql = require('./queries.js');

module.exports.getUserByUsername = (username) => {
    return new Promise((res, rej) => {
        db.connect().then((obj) => {
            obj.one(sql.getUser, [username]).then((data) => {
                res(data);
                obj.done();
            }).catch((error) => {
                console.log(error);
                rej(error);
                obj.done();
            });
        }).catch((error) => {
            console.log(error);
            rej(error);
        });
    });
}

module.exports.comparePassword = (candidatePassword, hash) => {
    return new Promise((res, rej) => {
        bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
            if (err) throw rej(err);
            res(isMatch);
        });
    });
};

module.exports.registerUser = (phone, username, password, name, email) => {
    return new Promise((res, rej) => {
        db.connect().then((obj) => {
            obj.none(sql.newUser, [phone, username, name, email, password, '', new Date()])
                .then(() => {
                    res({
                        message: "OK",
                        status: 200
                    });
                    obj.done();
                }).catch((error) => {
                    console.log(error);
                    rej({
                        error: error,
                        msg: 'not Created',
                        status: 500
                    });
                    obj.done();
                });
        });
    });
};

module.exports.updateProfile = async (req, username, email, name, phone) => {
    try{
        await db.none(sql.updateUser, [username, email, name, phone, req.user.users_id]);
        return ({
            status: 200,
            message:'lo lograste'
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};
