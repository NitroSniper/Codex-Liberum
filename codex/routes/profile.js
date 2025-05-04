const express = require('express');
const { pool } = require('../db/db');  
const { sessionMiddleware } = require('../models/auth'); 
const router = express.Router();

router.get('/get-user-profile', sessionMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
  
     const result = await pool.query('SELECT username, isverified FROM users WHERE id = $1', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(result.rows[0]);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;
