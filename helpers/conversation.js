const db = require('./db');
const sql = require('./queries.js');

module.exports.getListChats = async (req) => {
    try{
        let c = await db.any(sql.getListConversation, [req.user.users_id]);
        await Promise.all(c.map(async el => {
            el.participants = await db.any(sql.getConversationParticipants, [el.conversations_id]);
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

