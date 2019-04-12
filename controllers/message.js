const express = require('express');
let router = express.Router();
const auth = require('./../middlewares/jwtAuth');
const Message = require('./../helpers/message');

router.get('/chats/:chatId', auth, async (req,res)=>{
    try{
        const resp = await Message.getListMessage(req.params.chatId);
        console.log(resp);
        res.status(resp.status).send(resp);
    }catch(err){
        res.send(500).send(err);
    }
});

router.post('/chats/:chatId', auth, async (req,res)=>{
    try{
        const resp = await Message.createMessage(req.user.users_id, req.params.chatId, '', req.body.body);
        console.log(resp);
        res.status(resp.status).send(resp);
    }catch(err){
        res.send(500).send(err);
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