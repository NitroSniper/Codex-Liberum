const express = require('express');
let dots = require("../views/dots")
const router = express.Router();
// const { sessionMiddleware } = require('../models/auth');
const { query } = require('../db/db');

router.get('/unverified-users', async (req, res) => {
    console.log(req.session);
    if (req.session === null) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    try {
      const result = await query('SELECT id, username FROM users WHERE isverified = false');
      console.log(result);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching unverified users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  // router.post('/verify-users', sessionMiddleware, async (req, res) => {
  //   if (!req.ismoderator) return res.status(403).json({ message: 'Forbidden' });
  //
  //   const { userIds } = req.body;
  //   if (!Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid input' });
  //
  //   try {
  //     await query('UPDATE users SET isverified = true WHERE id = ANY($1)', [userIds]);
  //     res.json({ success: true });
  //   } catch (error) {
  //     console.error('Error verifying users:', error);
  //     res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // });
  //

  module.exports = router;

  