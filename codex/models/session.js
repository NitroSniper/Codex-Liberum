const crypto = require('crypto');
const { pool } = require('../db/db');

function generateSessionToken() {
    return crypto.randomBytes(16).toString('hex');
}

async function createSession(userId, maxAgeMinutes = 15) {
    const token = generateSessionToken();
    const now = new Date();

    //Time the session token expires at
    //const expiresAt = new Date(Date.now() + maxAgeMinutes * 60 * 1000); //what we can use - 15mins
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now - test purposes
    //const expiresAt = new Date(Date.now() + (1 * 60 + 10) * 60 * 1000); // 1 hour + 10 minutes - test purposes


    await pool.query(`
        INSERT INTO sesh (user_id, session_token, last_active, expires_at)
        VALUES ($1, $2, $3, $4)
    `, [userId, token, now, expiresAt]);

    return { token, expiresAt };
}

async function getSession(token) {
    const result = await pool.query(`
        SELECT s.*, u."ismoderator"
        FROM sesh s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = $1 AND s.expires_at > NOW()
    `, [token]);

    return result.rows[0]; 
}

module.exports = {
    createSession,
    getSession,
    //deleteSession
};