const express = require('express');
let router = express.Router();
const auth = require('./../middlewares/jwtAuth');
const Chat = require('./../helpers/conversation');

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