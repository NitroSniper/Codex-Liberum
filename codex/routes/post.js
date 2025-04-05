var express = require('express');
const { Pool } = require('pg');
var router = express.Router();

// PostgreSQL Database Connection
const pool = new Pool({
    user: 'admin',
    host: 'db', 
    database: 'post',
    password: 'example',  
    port: 5432,
  })
  
  module.exports = pool;

// get posts from database 
router.get('/', async (req, res) => { 
    try {
        const result = await pool.query('SELECT * FROM "Post" ORDER BY "dateTime" DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;