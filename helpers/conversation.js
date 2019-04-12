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
