const socketIO = require('socket.io');
const server = require('http').createServer();
//server.listen(8464);

module.exports = server;
module.exports = socketIO(server);