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
        const message = await db.any(sql.createMessage, [usersId, chatId, attachment, body, new Date()]);
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
