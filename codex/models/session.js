const crypto = require('crypto');
const {query} = require('../db/db');

function generateSessionToken() {
    return crypto.randomBytes(16).toString('base64'); // 128 bit of entropy
}


const keepAliveSessionTimestamp = () => new Date(Date.now() + 3 * 60 * 1000); // 3 minute from now

async function createSession(userId) {
    const token = generateSessionToken();

    //const expiresAt = new Date(Date.now() + (1 * 60 + 10) * 60 * 1000); // 1 hour + 10 minutes - test purposes
    const expiresAt = keepAliveSessionTimestamp();

    await query(`
        INSERT INTO sesh (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)`, [userId, token, expiresAt]);

    return token;
}

async function getSession(token) {
    const result = await query(`
        SELECT s.*, u."ismoderator"
        FROM sesh s
                 INNER JOIN users u ON s.user_id = u.id
        WHERE s.session_token = $1
          AND s.expires_at > NOW()
    `, [token]);

    return result.rows[0];
}

const updateSessionToNow = async (session_id) => await query(`UPDATE sesh SET expires_at = $2 WHERE session_token = $1`, [session_id, keepAliveSessionTimestamp()]);

module.exports = {
    createSession,
    getSession,
    updateSessionToNow,
};