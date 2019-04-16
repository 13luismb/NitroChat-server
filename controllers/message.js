const express = require('express');
let router = express.Router();
const auth = require('./../middlewares/jwtAuth');
const http = require('./../index');
const upload = require('./../helpers/uploads');
const Message = require('./../helpers/message');
const io = require('./../helpers/socketconfig');

io.sockets.on('connection', socket =>{
    console.log(socket.rooms);
    console.log('hola');
    console.log(socket);
    socket.on('culo', data => {
        socket.join(socket.id);
        io.sockets.to(socket.id).emit('aaa');
        console.log(socket.rooms);
        console.log('mamamelo');
    });
})


router.get('/chats/:chatId', auth, async (req,res)=>{
    try{
        const resp = await Message.getListMessage(req.params.chatId);
        console.log(resp);
        res.status(resp.status).send(resp);
    }catch(err){
        res.send(500).send(err);
    }
});

router.post('/culo', async (req,res)=>{
    io.emit('culo', req.body);
    res.status(200).send({message:'queslaverga'});
})



router.post('/chats/:chatId', auth, upload.any(),  async (req,res)=>{
    try{
        if(req.files.length > 0){
            const dir = req.files[0].path.replace('public','views');
            let resp = await Message.createMessage(req.user.users_id, req.params.chatId, dir, req.body.body);
            io.emit('webo', console.log('cabeza'));
            console.log('lo logramos',resp);
            res.status(resp.status).send(resp);
        }else{
            let resp = await Message.createMessage(req.user.users_id, req.params.chatId, '', req.body.body);
            console.log('sapencio', resp);
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