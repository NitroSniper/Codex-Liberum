// routes/moderator.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db/db'); 
const { sessionMiddleware } = require('../models/auth'); 

// Middleware to check if the user is a moderator
function requireModerator(req, res, next) {
        if (!req.userId || !req.ismoderator) {
            return res.status(403).json({ message: 'Access denied' });
    }
    next();
}

// Get unverified users
router.get('/unverified-users', sessionMiddleware, requireModerator, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username FROM users WHERE isverified = false'
        );
        res.json({ users: result.rows });
    } catch (err) {
        console.error('Error fetching unverified users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Verify user
router.post('/verify-user', sessionMiddleware, requireModerator, async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.query('UPDATE users SET isverified = true WHERE id = $1', [userId]);
        res.json({ message: 'User verified successfully' });
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).json({ message: 'Verification failed' });
    }
});

module.exports = router;
