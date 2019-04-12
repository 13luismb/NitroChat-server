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
        await db.none(sql.updateUser, [username, name, email, phone, req.user.users_id]);
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

module.exports.setPhoto = async (req, res) => {
    const user = req.user;
    console.log(req);
    if (req.files) {
        const image = req.files.image;
        const basePath = __dirname+"/../../public/";
        const filePath = "img/uploads/profile/"+new Date().getTime()+"-"+image.name;
        user.users_picture_url = filePath;
        image.mv(basePath+filePath, (error) => {
            if (!error) {
                user.save(async err => {
                    if (err) {
                        res.status(500).json({error: err});
                    } else {
                        await db.none(sql.updatePicture, [filePath])
                        res.status(200).json({user});
                    }
                });
            } else {
                res.status(500).json({error: err});
            }
        })
    } else {
        res.status(400).json({error: "No Photo sent."});
    }
};

module.exports.uploadAndSave = function (images, callback) {
        // const imager = new Imager(imagerConfig, "S3");
        const self = this;
        if (!images || !images.length) {
            return this.save(callback);
        }
        imager.upload(
            images,
            (err, cdnUri, files) => {
                if (err) {
                    return callback(err);
                }
                if (files.length) {
                    self.image = {cdnUri: cdnUri, files: files};
                }
                self.save(callback);
            },
            "article"
        );
    }