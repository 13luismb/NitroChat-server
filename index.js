const express = require('express');
//let session = require('express-session');
const fs = require('fs');
const app = express();
const jwt = require('express-jwt');
const upload = require('./helpers/uploads');
const config = require('./helpers/config');
let passport = require('passport');
let strategies = require('./helpers/strategies');
//const fileUpload = require('express-fileupload');
let auth = require('./middlewares/isAuth');
let http = require("http").Server(app);
//const io = require('socket.io')(http);
const server = require('./helpers/socketconfig');
server.listen(config.socketPort);

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
//const models_path = __dirname+'/helpers';
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
http.listen(config.port, function() {
    console.log('Example app listening on port 3001!');
});


/*                  AQUI EMPIEZA SOCKET.IO                      */
/*io.sockets.on('connection', socket => {
    console.log('conectao');
        socket.on('hola', data => {
            console.log(data);
        })
        socket.on('send-message', message => {
            
        });
        socket.on('enter-chat', async data => {
        //    const resp = await Message.getListMessage(data.chatId);
            socket.emit('get-messages', resp);
        });
/*
        socket.on('initiate-chat', async data => {
            const resp = await Conversation.newConversation(data.token, data.type, data.converName, data.users);
            socket.emit('enter-chat', resp);
        });

        socket.on("disconnect", function() {
            console.log('bye')
            let index = users[socket.room].findIndex(el => el === socket.nickname);
            users[socket.room].splice(index, 1);
          });

});*/
