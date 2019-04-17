const db = require('./db');
const sql = require('./queries.js');


module.exports.newConversation = async (req, type, converName, users) => {
    let totalUsers;
    try{
        let conversationName;
        if(type == 1){
            conversationName= null;
        }else {
            conversationName = converName;
        }
       const conversation = await  db.one(sql.createConversation, [type, req.user.users_id, conversationName, new Date() ]);
        for (user of users){
            await db.none(sql.createUsersConversation, [user, type, conversation.conversations_id]);
        }
        totalUsers = await db.any(sql.getConversationParticipants, [conversation.conversations_id]);
        return ({
            status: 200,
            message:'ok',
            conversation_id: conversation.conversations_id,
            participants: totalUsers
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};

module.exports.getListChats = async (req) => {
    try{
        let c = await db.any(sql.getListConversation, [req.user.users_id]);
        await Promise.all(c.map(async el => {
            el.participants = await db.any(sql.getConversationParticipants, [el.conversations_id]);
            el.last_message = await db.any(sql.getLastMessage, [el.conversations_id]);
        }));
        return ({
            status: 200,
            chats: c
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};

module.exports.doesChatExist = async (req, target) => {
    try{
        let userChats = await db.any(sql.getAllChats, req.user.users_id);
        let targetChats = await db.any(sql.getAllChats, target);
        if (userChats.length > 0 && targetChats.length > 0){
            for (let m of userChats){
                for (let n of targetChats){
                    if (m.conversations_id === n.conversations_id){
                        return ({
                            res: true,
                            chatId: m.conversations_id
                        })
                    }
                }
            }
        }
        return ({
            res:false
        })
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500,
            message: 'nop'
        }
    }
}

module.exports.getDataFromChat = async (req, target) => {
    try{
        const exists = await this.doesChatExist(req,target);
        if (!exists.res){
            const chat = await db.one(sql.createConversation, [1, req.user.users_id, null,new Date()]);
            await db.none(sql.createUsersConversation, [req.user.users_id, 1, chat.conversations_id]);
            await db.none(sql.createUsersConversation, [target, 1, chat.conversations_id]);
            const participants = await db.any(sql.getConversationParticipants, [chat.conversations_id]);
            return ({
                status:201,
                participants: participants
            });
        }else{
            const data = await db.any(sql.getListMessages, [exists.chatId]);
            const chat = await db.any(sql.getChat, [exists.chatId]);
            data.map(el => {
             el.isMine = (el.users_id === req.user.users_id ? true : false);
            });
            const participants = await db.any(sql.getConversationParticipants, [exists.chatId]);
            return ({
                status:200,
                participants: participants,
                messages: data,
                chat: chat
            });
        }
    }catch(e){
        console.log(e);
        return ({
            error: e,
            status: 500,
            message: 'no hay vida'
        })
    }
}