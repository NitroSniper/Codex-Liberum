const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const {query} = require("../db/db");
/* GET home page. */
router.get('/', (req, res) => {
    if (req.session === null || !req.session.isModerator) return res.status(401).send('Insufficient Permission');
    res.send(dots.moderator());
})


router.get('/unverified-users', async (req, res) => {
    if (req.session === null) {
        return res.status(403).json({message: 'Forbidden'});
    }

    try {
        const result = await query('SELECT id, username FROM users WHERE isverified = false ORDER BY username');
        console.log(result);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching unverified users:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.post('/verify-users', async (req, res) => {
    if (req.session === null) {
        return res.status(403).send(dots.message({message: 'Forbidden'}));
    }

    const {userIds} = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({message: 'Invalid input'});

    try {
        await query('UPDATE users SET isverified = true WHERE id = ANY($1)', [userIds]);
        res.json({success: true});
    } catch (error) {
        console.error('Error verifying users:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

module.exports = router;
