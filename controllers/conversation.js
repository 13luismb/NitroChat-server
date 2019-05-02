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


    router.post('/newChat', auth, async (req,res)=>{
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
    });

    router.delete('/group/:chatId/:userId', auth, async (req, res) => {
        const {chatId, userId} = req.params;
        try{
            const resp = await Chat.outOfGroup(chatId, userId);
            io.sockets.in(`chat ${chatId}`).emit('get-msg', resp.message);
            res.status(resp.status).send(resp);
        }catch(e){
            console.log(e);
            res.status(500).send({status:500, error: e});
        }
    });

    router.delete('/group/:chatId', auth, async (req, res) => {
        const {chatId} = req.params;
        try{
            const resp = await Chat.eraseGroup(chatId);
            res.status(resp.status).send(resp);
        }catch(e){
            res.status(500).send({status:500,error:e})
        }
    })

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



module.exports = router;