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
        let type;
        switch(file.mimetype){
            case 'image/jpeg': type = `.jpeg`; break;
            case 'image/jpg': type = '.jpg'; break;
            case 'image/png': type = '.png'; break;
            case 'image/gif': type = '.gif'; break;
        }
        cb(null, `${new Date().getTime()}${type}`)
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