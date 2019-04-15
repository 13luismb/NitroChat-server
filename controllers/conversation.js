const express = require('express');
const auth = require('./../middlewares/jwtAuth');
let router = express.Router();
const Chat = require('./../helpers/conversation');


    router.post('/newChat', async (req,res)=>{
       // const io = req.app.get('socketio');
        const resp = await Chat.newConversation(req, req.body.type, req.body.converName, req.body.users);
        if (resp.status === 200){
            socket.join(resp.conversation_id);
            res.status(200).send(resp)
        }
    });

    router.get('/chats', auth, async (req,res)=>{
        try{
            const resp = await Chat.getListChats(req);
            console.log(resp);
            res.status(resp.status).send(resp);
        }catch(err){
            res.send(500).send(err);
        }
    });

module.exports = router;