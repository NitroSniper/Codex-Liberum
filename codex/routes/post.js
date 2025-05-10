const express = require('express');
const { query } = require('../db/db');
const router = express.Router();

// get posts from database
router.get('/get-posts', async (req, res) => {
    console.log(req.headers);
    const name = req.query.name;
    const amount = req.query.amount;
    try {
        const result = await query('SELECT title, username FROM posts INNER JOIN users on posts.created_by = users.id WHERE title LIKE $1 ORDER BY "created" DESC LIMIT $2', [`%${name}%`, amount]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        // should be bad
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;