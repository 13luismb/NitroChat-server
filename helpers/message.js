const db = require('./db');
const sql = require('./queries.js');

module.exports.getListMessage = async (req, chatId) => {
    try{
        const messages = await db.any(sql.getListMessages, [chatId]);
        await Promise.all(messages.map(async el => {
            console.log('que es la verga');
            el.isMine = (el.users_id === req.user.users_id ? true : false);
        }));
        return ({
            status: 200,
            messages: messages
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};

module.exports.createMessage = async (usersId, chatId, attachment, body) => {
    try{
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        const message = await db.one(sql.createMessage, [usersId, chatId, attachment, body, dateTime]);
        const simpleInfo = await db.one(sql.getSimpleInfo, [usersId]);
        message.users_name = simpleInfo.users_name;
        message.users_username = simpleInfo.users_name;
        return ({
            status: 200,
            message: message
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};

module.exports.deleteMessage = async (chatId, messageId) => {
    try{
        await db.any(sql.deleteMessage, [messageId, chatId]);
        return ({
            status: 200,
            message: 'deleted'
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};

module.exports.updateMessage = async (messageId, body) => {
    try{
        await db.none(sql.updateMessage, [body, messageId]);
        return ({
            status: 200,
            message:'updated'
        });
    }catch(e){
        console.log(e);
        return {
            error: e,
            status: 500
        }
    }
};

module.exports.getDataFromChat = async (req, chatId) => {
    try{
            const data = await db.any(sql.getListMessages, [chatId]);
            const chat = await db.oneOrNone(sql.getChat, [chatId]);
            data.map(el => {
             el.isMine = (el.users_id === req.user.users_id ? true : false);
            });
            const participants = await db.any(sql.getConversationParticipants, [chatId]);
            return ({
                status:200,
                participants: participants,
                messages: data,
                chat: chat
            });
    }catch(e){
        console.log(e);
        return ({
            error: e,
            status: 500,
            message: 'no hay vida'
        })
    }
}