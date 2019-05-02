const express = require('express');
let router = express.Router();
const auth = require('./../middlewares/jwtAuth');
const http = require('./../index');
const upload = require('./../helpers/uploads');
const Message = require('./../helpers/message');
const db = require('./../helpers/db');
const sql = require('./../helpers/queries.js');
const io = require('./../helpers/socketconfig');


/*                  IT WORKS                */
io.sockets.on('connection', socket =>{
	console.log('connected');
	 socket.on("disconnect", function() {
    console.log('bye')
  });
	/* 		WORKING PERFECTLY 		*/
	socket.on('open-app', data => {
		socket.room = data.room;
		socket.join(data.room);
	})
	socket.on('open-chat', data => {
		// socket.room = data.room;
		socket.join(data.room);
		console.log(Object.keys(socket.rooms));
	})
    socket.on('leave-chat', data => {
        socket.leave(data.room);
    })
	socket.on('send-msg', async data => {
        let resp;
        let user = `user`;
        if (data.attachment === null){
          resp  = await Message.createMessage(data.id, data.chatId, null, data.message);
        }else{
            const file = upload.storeFile(data.attachment, data.chatId);
            resp  = await Message.createMessage(data.id, data.chatId, file, data.message);
        }
        let chat = await db.one(sql.getSingleChat, [data.chatId]);
        chat.participants = await db.any(sql.getConversationParticipants, [data.chatId]);
        chat.last_message = resp.message;
        await db.none(sql.undeleteConversation, [data.chatId]);
		io.sockets.in(data.room).emit('get-msg', resp.message);
        for (let a of data.targets){
            console.log(user,a);
        io.sockets.in(user, a).emit('dash-msg', chat);
        }
	});

    socket.on('fwd-msg', async data => {
        for (let a of data.targets){
            let resp;
            if (data.attachment === null){
              resp  = await Message.createMessage(data.id, a.chatId, null, data.message);
            }else{
                const file = upload.copyImage(data.attachment, a.chatId, data.oldChatId);
                resp  = await Message.createMessage(data.id, a.chatId, file, data.message);
            }
            let chat = await db.one(sql.getSingleChat, [a.chatId]);
            chat.participants = await db.any(sql.getConversationParticipants, [a.chatId]);
            chat.last_message = resp.message;
            await db.none(sql.undeleteConversation, [a.chatId]);
            io.sockets.in(a.room).emit('get-msg', resp.message);
            io.sockets.in(a.user).emit('dash-msg', chat);
        }
    });

	/*		NEEDS TO BE FINISHED		*/
	socket.on('update-msg', async data => {
        const resp = await Message.updateMessage(data.messageId, data.message);
		io.sockets.in(data.room).emit('receive-update', resp);
	});
	socket.on('delete-msg', async data => {
        const resp = await Message.deleteMessage(data.chatId, data.messageId);
		io.sockets.in(data.room).emit('message-was-deleted', data);
	});
})

    router.get('/chats/:chatId/messages', auth, async (req,res)=>{
        try{
            console.log(req.params.chatId);
            const resp = await Message.getDataFromChat(req, req.params.chatId);
            res.status(resp.status).send(resp);
        }catch(err){
            res.send(500).send(err);
        }
    });

/*              DOESNT WORK                     */
  


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