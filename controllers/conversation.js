const express = require('express');
const auth = require('./../middlewares/jwtAuth');
let router = express.Router();
const Chat = require('./../helpers/conversation');
const io = require('./../helpers/socketconfig');

/*              IT WORKS                */
/*              THIS IS NECESSARY           */



  router.get('/chats/:userId', auth, async (req,res) => {
        try{
            const resp = await Chat.getDataFromChat(req, req.params.userId);
            res.status(resp.status).send(resp);
        }catch(e){
            res.status(500).send(e);
        }
    });

      router.get('/chats', auth, async (req,res)=>{
        try{
            const resp = await Chat.getListChats(req);
            console.log(resp);
            res.status(resp.status).send(resp);
        }catch(err){
            res.status(500).send(err);
        }
    });


    router.delete('/chats/:chatId/:userId', auth, async (req,res) => {
        try{
            const resp = await Chat.deleteChat(req.params.chatId, req.params.userId);
            const data = {chat: resp.conversation, }
            io.sockets.in()
            res.status(resp.status).send(resp);
        }catch(e){
            res.status(500).send(e);
        }
    });

/*
    router.get('/chats/:chatId/messages', auth, async (req,res) => {
        try{
            const resp = await Chat.getDataFromChat(req, req.params.userId);
            io.sockets.in('hola').emit(console.log('soltame ya',resp));
            res.status(resp.status).send(resp);
        }catch(e){
            res.status(500).send(e);
        }
    });*/

    
/*             DOESNT WORK              */

    router.post('/newChat', async (req,res)=>{
       // const io = req.app.get('socketio');
        try{
            const resp = await Chat.newConversation(req, req.body.type, req.body.converName, req.body.users);
            const message = {...resp.conversation, last_message: resp.message, participants: resp.participants};
            let users = message.participants.map(el => {
                if (el.users_id === req.user.users_id){
                    return null
                }else{
                    return el.users_id;
                }
            });
            users = users.filter(part => part !== null);
            for (let a of users){
                io.sockets.in(`user ${a}`).emit('dash-msg', message);
            }
            res.status(resp.status).send(resp);
        }catch(e){
            console.log(e);
            res.send({status:500, error:e});
        }
       /* if (resp.status === 200){
            socket.join(resp.conversation_id);
            res.status(200).send(resp)
        }*/
    });


module.exports = router;