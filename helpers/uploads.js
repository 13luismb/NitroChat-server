const multer = require('multer');
var fs = require('fs');

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
                let dir = `./public/uploads/${req.user.users_id}`;

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                cb(null, dir);

    },
    filename: function(req, file, cb) {
        cb(null, `${file.originalname}`)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        switch (file.mimetype) {
            case 'image/jpeg':
                cb(null, true)
                break;
            case 'image/jpg':
                cb(null, true)
                break;
            case 'image/png':
                cb(null, true)
                break;
            case 'image/gif':
                cb(null, true)
                break;
            default:
                return cb(new Error('Wrong file type'))
        }
    }
});

module.exports = upload;