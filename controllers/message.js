const express = require('express');
let router = express.Router();
const auth = require('./../middlewares/jwtAuth');
const http = require('./../index');
const upload = require('./../helpers/uploads');
const Message = require('./../helpers/message');
const io = require('./../helpers/socketconfig');

/*                  IT WORKS                */
io.sockets.on('connection', socket =>{
	console.log('connected');
	 socket.on("disconnect", function() {
    console.log('bye')
  });
	/* 		WORKING PERFECTLY 		*/
	socket.on('open-app', data => {
		console.log (data);
		socket.room = data.room;
		socket.join(data.room);
	})
	socket.on('open-chat', data => {
		// socket.room = data.room;
		socket.join(data.room);
		console.log(Object.keys(socket.rooms));
	})
	socket.on('send-msg', async data => {
		console.log(data);
        let resp;
        if (data.attachment === null){
          resp  = await Message.createMessage(data.id, data.chatId, null, data.message);
        }else{
            const file = upload.storeFile(data.attachment, data.chatId);
            resp  = await Message.createMessage(data.id, data.chatId, file, data.message);
        }
		//db logic missing here
		io.sockets.in(data.room).emit('get-msg', resp.message);
		io.sockets.in(data.user).emit('dash-msg', resp.message);
	});

	/*		NEEDS TO BE FINISHED		*/
	socket.on('onMessageUpdate', data => {
		socket.emit('onReceiveUpdate', data);
	});
	socket.on('delete-msg', async data => {
        const resp = await Message.deleteMessage(data.chatId, data.messageId);
        console.log(data, 'te mariquiaste o q');
		io.sockets.in(data.room).emit('message-was-deleted', data);
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