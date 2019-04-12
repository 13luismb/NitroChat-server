const express = require('express');
//let session = require('express-session');
const fs = require('fs');
const app = express();
const jwt = require('express-jwt');
const config = require('./helpers/config');
let passport = require('passport');
let strategies = require('./helpers/strategies');
//const fileUpload = require('express-fileupload');
let auth = require('./middlewares/isAuth');


app.use('/views', express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(jwt({
    secret: config.secret
}).unless({
    path: ['/login', '/register', '/']
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./controllers'));
app.get('/', function(req, res) {
    res.redirect('views/index.html');
});
const models_path = __dirname+'/helpers';
// fs.readdirSync(models_path).forEach(file => {
//   require(models_path+'/'+file);
// });
// app.use(fileUpload());
app.use(auth.isValidToken);
passport.use(strategies.localStrategy);
passport.use(strategies.jwtStrategy);
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
app.listen(config.port, function() {
    console.log('Example app listening on port 3001!');
});
