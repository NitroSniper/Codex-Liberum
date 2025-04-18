const express = require('express');
const { pool } = require('../db/db');
const router = express.Router();

// PostgreSQL Database Connection

  module.exports = pool;

// get posts from database 
router.get('/', async (req, res) => { 
    try {
        const result = await pool.query('SELECT * FROM "posts" ORDER BY "created" DESC');
        res.json(result.rows);
        // res.send(dots.index());
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;