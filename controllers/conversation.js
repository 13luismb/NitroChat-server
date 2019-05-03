const express = require('express');
const auth = require('./../middlewares/jwtAuth');
let router = express.Router();
const Chat = require('./../helpers/conversation');
const upload = require('./../helpers/uploads');
const multer = require('./../helpers/multer');
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
            console.log(req.body);
            const resp = await Chat.newConversation(req, req.body.typeConversation, req.body.converName, req.body.users);
            if(req.body.attachment) {
            	const file = upload.storeFile(req.body.attachment,resp.conversation.conversations_id);
            	const x = await Chat.updateGroupPic(file, resp.conversation.conversations_id);
            	resp.conversation.conversation_picture_url = file;
            }
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
            console.log('lo lograste');
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
    });

    router.post('/group/:chatId/updatePicture', auth, multer.single('image'), async (req, res) => {
        const {chatId} = req.params;
        try{
            console.log(req.file);
            const dir = req.file.path.replace('public','views');
            const resp = await Chat.updateGroupPic(dir, chatId);
            io.sockets.in(`chat ${chatId}`).emit('group-profile-updated', dir);
            res.status(resp.status).send(resp);
        }catch(e){
            console.log(e);
            res.status(500).send({status:500, error:e});
        }
    });

    router.get('/group', auth, async (req, res) => {
        try{
            const resp = await Chat.getGroupChats(req);
            res.status(resp.status).send(resp);
        }catch(e){
            res.status(500).send({status:500,error:e});
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