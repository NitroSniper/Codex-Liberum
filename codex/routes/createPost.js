const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const { pool } = require('../db/db');
const { sessionMiddleware } = require('../models/auth');
// const { sessionMiddleware } = require('../models/auth');
// const crypto = require('crypto');
// const multer = require('multer');

/*
// Only allow logged in, verified users
function requireVerified(req, res, next) {
  if (!req.userId || !req.isverified) {
    return res.status(403).send('Only verified users may create posts.');
  }
  next();
}
*/

// (Assuming you export a factory that takes multer upload)
module.exports = (upload) => {
  // apply auth checks to all create-post routes
  router.use(sessionMiddleware);

  router.get('/', (req, res) => {
    res.send(dots.createPost());
  });

  router.post('/submit', upload.single('photo'), async (req, res) => {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
      return res.status(400).send('Title, category, content required.');
    }
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      await pool.query(
        `INSERT INTO posts (title, category, content, image_url)
         VALUES ($1,$2,$3,$4)`,
        [title, category, content, imageUrl]
      );
      res.redirect('/create-post/submit');
    } catch (err) {
      console.error('Create Post Error:', err);
      res.status(500).send('Could not create post.');
    }
  });


  router.get('/submit', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>News blog - post created</title>
    </head>
    <body>
      <h3>Your post has been created!</h3>
      <p><a href="/dashboard">Go to index page</a></p>
    </body>
    </html>
  `);
  });
  return router;
};

// module.exports = router;
