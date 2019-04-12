const express = require('express');
const passport = require('passport');
const auth = require('./../middlewares/jwtAuth');
const jwt = require('jsonwebtoken');
let router = express.Router();
const Conversation = require('./../helpers/conversation');
const config = require('./../helpers/config');
const server = require('./../index.js');







    router.post('/newChat', async (req,res)=>{
        const io = req.app.get('socketio');
        const resp = await Conversation.newConversation(req, req.body.type, req.body.converName, req.body.users);
        if (resp.status === 200){
            socket.join(resp.conversation_id);
            res.status(200).send(resp)
        }
    });










module.exports = router;


