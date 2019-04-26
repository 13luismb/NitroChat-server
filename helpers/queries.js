const PS = require('pg-promise').PreparedStatement;
let queries = {
        
        newUser: new PS('new-user', "INSERT INTO USERS (users_phone, users_username, users_name, users_email, users_password, user_picture_url, users_creation_time) VALUES ($1, $2, $3, $4, $5, $6, $7)"),
        getUser: new PS('get-user', "SELECT * FROM USERS WHERE users_username = $1"),
        getUserByPhone: new PS('get-user-by-phone', 'SELECT * FROM USERS WHERE users_phone = $1'),
        getUserByEmail: new PS('get-user-by-email', 'SELECT * FROM USERS WHERE users_email = $1'),
        getLastMessage: new PS('last-message', 'SELECT * FROM MESSAGE WHERE conversations_id=$1 ORDER BY created_at DESC LIMIT 1'),
        updateUser: new PS('update-user', "UPDATE USERS SET users_username = $1, users_name = $2, users_email = $3, users_phone = $4 WHERE users_id = $5"),
        updatePicture: new PS('update-profile-pic', 'UPDATE USERS SET user_picture_url = $1 WHERE users_id = $2'),
        createStatus: new PS('create-status','INSERT INTO STATUS (STATUS_DESCRIPTION) VALUES ($1)'),
        createUserStatus: new PS('create-user-status', 'INSERT USERS_STATUS (users_id, status_id, is_active) VALUES ($1, $2, true)'),
        getListStatus: new PS('get-status','SELECT st.* from status st INNER JOIN users_status us ON st.status_id = us.status_id WHERE us.users_id = $1'),
        deleteStatus: new PS('delete-status','DELETE FROM STATUS WHERE status_id = $1'),
        getAllChats: new PS('all-chats', 'select cu.conversations_id from conversations_users  cu inner join conversations co on cu.conversations_id=co.conversations_id where co.type_conversation_id=1 AND cu.users_id = $1'),
        createConversation: new PS('create-chat','insert into conversations (type_conversation_id, creator_id, conversation_name, created_at) VALUES ($1,$2,$3,$4) returning conversations_id'),
        createUsersConversation: new PS('create-user-conversation', 'INSERT INTO CONVERSATIONS_USERS (users_id, type_users_id, conversations_id) VALUES ($1,$2,$3)'),
        getChat: new PS('get-chat','SELECT * FROM CONVERSATIONS WHERE conversations_id = $1'),
        getSimpleInfo: new PS ('simple-info', 'SELECT users_username, users_name FROM users WHERE users_id = $1'),
        getListConversation: new PS('get-chats','select co.* from conversations co inner join conversations_users cu on co.conversations_id = cu.conversations_id WHERE cu.users_id = $1'),
        getConversationParticipants: new PS('get-participants', 'select cu.*, us.* from conversations co inner join conversations_users cu on co.conversations_id = cu.conversations_id INNER JOIN users us ON cu.users_id = us.users_id WHERE cu.conversations_id = $1'),
        deleteConversation: new PS('delete-chat','UPDATE conversations_users SET deleted_at=$1, is_deleted=true WHERE users_id = $2 AND conversations_id = $3'),
        undeleteConversation: new PS('undelete-chat', 'UPDATE conversations_users SET is_deleted = false WHERE conversations_id=$1'),
        createMessage: new PS('create-message','INSERT INTO MESSAGE (users_id, conversations_id, message_attachment, message_body, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *'),
        getListMessages: new PS('get-messages','SELECT me.*,us.users_id, us.users_username, us.users_name FROM MESSAGE me INNER JOIN USERS us ON us.users_id = me.users_id WHERE me.conversations_id = $1 ORDER BY created_at'),
        deleteMessage: new PS('delete-message','DELETE FROM MESSAGE WHERE message_id = $1 AND conversations_id = $2'),
        editMessage: new PS('edit-message','UPDATE MESSAGE SET message_body = $1 WHERE message_id= $2 RETURNING *'),
        searchUser: new PS('search-user', 'SELECT * FROM USERS WHERE LOWER(users_name) LIKE $1')

}

module.exports = queries;
