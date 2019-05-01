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
            res.status(resp.status).send(resp);
        }catch(e){
            res.send({status:500, error:e});
        }
       /* if (resp.status === 200){
            socket.join(resp.conversation_id);
            res.status(200).send(resp)
        }*/
    });


module.exports = router;