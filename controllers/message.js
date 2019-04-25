const express = require('express');
let router = express.Router();
const auth = require('./../middlewares/jwtAuth');
const http = require('./../index');
const upload = require('./../helpers/uploads');
const Message = require('./../helpers/message');
const io = require('./../helpers/socketconfig');

/*                  IT WORKS                */
io.sockets.on('connection', socket =>{
	socket.on('onMessageSend', data => {
		socket.emit('onMessageReceive', data);
		socket.emit('onMessageInDashboard', data);
	});
	socket.on('onMessageUpdate', data => {
		socket.emit('onReceiveUpdate', data);
	});
	socket.on('onDeleteMessage', data => {
		socket.emit('onReceiveDelete', data);
	});
})

/*              DOESNT WORK                     */
  
    router.get('/chats/:chatId/messages', auth, async (req,res)=>{
        try{
            console.log(req.params.chatId);
            const resp = await Message.getDataFromChat(req, req.params.chatId);
            res.status(resp.status).send(resp);
        }catch(err){
            res.send(500).send(err);
        }
    });


    router.post('/chats/:chatId', auth, /*upload.any(),*/  async (req,res)=>{
        try{
            if(req.files.length > 0){
                const dir = req.files[0].path.replace('public','views');
                let resp = await Message.createMessage(req.user.users_id, req.params.chatId, dir, req.body.body);
                res.status(resp.status).send(resp);
            }else{
                let resp = await Message.createMessage(req.user.users_id, req.params.chatId, '', req.body.body);
                res.status(resp.status).send(resp);
            }
        }catch(err){
            res.status(500).send(err);
        }
    });

    router.put('/chats/:chatId', auth, async (req,res)=>{
        try{
            const resp = await Message.updateMessage(req.params.chatId, req.body.body);
            console.log(resp);
            res.status(resp.status).send(resp);
        }catch(err){
            res.send(500).send(err);
        }
    });

    router.delete('/chats/:chatId/:messageId', auth, async (req,res)=>{
        try{
            const resp = await Message.deleteMessage(req.params.chatId, req.params.messageId);
            console.log(resp);
            res.status(resp.status).send(resp);
        }catch(err){
            res.send(500).send(err);
        }
    });

module.exports = router;