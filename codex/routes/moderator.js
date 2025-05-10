const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const {objectIsEmpty} = require('../models/util')

const {query} = require("../db/db");
/* GET home page. */
router.get('/', (req, res) => {
    if (objectIsEmpty(req.session) || !req.session.isModerator) return res.status(401).send(dots.message({message: 'Forbidden: Insufficient Permission'}));
    res.send(dots.moderator({csrf: req.csrfToken()}));
})


router.get('/unverified-users', async (req, res) => {
    if (objectIsEmpty(req.session) || !req.session.isModerator) return res.status(401).send(dots.message({message: 'Forbidden: Insufficient Permission'}));

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
    if (objectIsEmpty(req.session)) {
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
