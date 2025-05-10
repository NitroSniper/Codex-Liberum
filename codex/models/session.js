const crypto = require('crypto');
const {query} = require('../db/db');
const { generateTokenHash } = require('./csrf');

function generateSessionToken() {
    return crypto.randomBytes(16).toString('base64'); // 128 bit of entropy
}


const keepAliveSessionTimestamp = () => new Date(Date.now() + 3 * 60 * 1000); // 3 minute from now

async function createSession(req, userId) {
    const token = generateSessionToken();

    await query(`
        INSERT INTO sesh (user_id, session_token, expires_at, csrf_token)
        VALUES ($1, $2, $3, $4)`, [userId, token, keepAliveSessionTimestamp(), generateTokenHash()]);

    return token;
}

async function getSession(token) {
    const result = await query(`
        SELECT s.*, u."ismoderator", u.isverified
        FROM sesh s
                 INNER JOIN users u ON s.user_id = u.id
        WHERE s.session_token = $1
          AND s.expires_at > NOW()
    `, [token]);

    return result.rows[0];
}

const updateSessionToNow = async (session_id) => await query('UPDATE sesh SET expires_at = $2 WHERE session_token = $1', [session_id, keepAliveSessionTimestamp()]);

module.exports = {
    createSession,
    getSession,
    updateSessionToNow,
};