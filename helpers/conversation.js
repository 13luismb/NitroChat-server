const db = require('./db');
const sql = require('./queries.js');
const Message = require('./message');

module.exports.newConversation = async (req, type, converName, users) => {
    let totalUsers;
    try{
        let conversationName;
        if(type == 1){
            conversationName= null;
        }else {
            conversationName = converName;
        }
       let conversation = await  db.one(sql.createConversation, [type, req.user.users_id, conversationName, new Date() ]);
        for (user of users){
            if(user === req.user.users_id){
                await db.none(sql.createUsersConversation, [req.user.users_id, 2, conversation.conversations_id]);
            }else{
                await db.none(sql.createUsersConversation, [user, 1, conversation.conversations_id]);   
            }
        }
        totalUsers = await db.any(sql.getConversationParticipants, [conversation.conversations_id]);
        const message  = await Message.createMessage(req.user.users_id, conversation.conversations_id, null, 'created');
        return ({
            status: 200,
            message:'ok',
            conversation_id: conversation.conversations_id,
            conversation: conversation,
            participants: totalUsers,
            message: message.message
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
        console.log(c);
        let chats = [];
        chats = await Promise.all(c.map(async (el, index) => {
            el.participants = await db.any(sql.getConversationParticipants, [el.conversations_id]);
            el.last_message = await db.oneOrNone(sql.getLastMessage, [el.conversations_id]);
            if (el.last_message === null) console.log('dude');
            else return el
        }));
        chats = chats.filter(result => result !== undefined);
        chats = orderArrayByMessage(chats);
        console.log(chats);
        return ({
            status: 200,
            chats: chats
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
                            chatId: m.conversations_id,
                            deleted_at: m.deleted_at
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
            await db.none(sql.createUsersConversation, [target, 1, chat.conversations_id]);
            await db.none(sql.createUsersConversation, [req.user.users_id, 1, chat.conversations_id]);
            const participants = await db.any(sql.getConversationParticipants, [chat.conversations_id]);
            return ({
                status:201,
                participants: participants,
                chat: chat
            });
        }else{
            let data;
            if (exists.deleted_at){
            data = await db.any(sql.getListMessages, [exists.chatId]);
            }else{
            data = await db.any(sql.getDeletedListMessages, [exists.chatId, exists.deleted_at]);
            }
            const chat = await db.oneOrNone(sql.getChat, [exists.chatId]);
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

module.exports.deleteChat = async (chat, user) => {
    try{
        await db.none(sql.deleteConversation, [new Date(), user, chat]);
        return({
            status: 200,
            msg: 'deleted',
            chatId: chat
        })
    }catch(e){
        console.log(e);
        return({
            status:500,
            error: e
        })
    }
}

module.exports.outOfGroup = async (chatId, userId) => {
    try{
        let message  = await Message.createMessage(userId, chatId, null, 'has left the group');
        await db.none(sql.getOutOfGroup, [chatId, userId]);
        return ({status:200, message:message.message});
    }catch (e) {
        return ({status:500, error:e})
    }
}

module.exports.eraseGroup = async (chatId) => {
    try{
        await db.none(sql.deleteGroup, [chatId]);
        return ({status:200, msg:'group deleted'});
    }catch (e){
        return ({status:500, error:e})
    }
}

/*const orderArrayByMessage = (array) => {
    let aux;
    for (let i=0; i<array.length-1; i++){
        console.log(array[i].last_message.created_at < array[i+1].last_message.created_at);
        if (array[i].last_message.created_at < array[i+1].last_message.created_at){
            aux = array[i];
            array[i] = array[i+1];
            array[i+1] = aux;
            if(i>0){
                if(array[i].last_message.created_at > array[i-1].last_message.created_at){
                    aux = array[i];
                    array[i] = array[i-1];
                    array[i-1] = aux;
                }     
            }

        }
    }
    return array;
}*/

const orderArrayByMessage = (array) => {
    return array.sort((a,b)=> {
            if(a.last_message.created_at < b.last_message.created_at){
                return 1;
            }else if (a.last_message.created_at > b.last_message.created_at){
                return -1;
            }   
            return 0;
        })
}