let User = require('./users');
let localStrategy = require('passport-local').Strategy;
let JWTStrategy = require('passport-jwt').Strategy;
let ExtractJWT = require('passport-jwt').ExtractJwt;
const config = require('./config');

module.exports.localStrategy = new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, function(username, password, done) {
    User.getUserByUsername(username).then((user) => {
        if (user.error) {
            return done(null, false);
        }
        User.comparePassword(password, user.users_password).then((isMatch) => {
            if (isMatch)
                return done(null, user);
            else {
                return done(null, false);
            }

        }).catch((err) => {
            console.log(err);
            return done(null, false);
        });
    }).catch((err) => {
        return done(null, false);
    });
});

module.exports.jwtStrategy = new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.secret
    },
    function(jwtPayload, cb) {
        User.getUserByUsername(jwtPayload.users_username)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    });