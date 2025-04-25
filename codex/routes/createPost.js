const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const { pool } = require('../db/db');
// const { sessionMiddleware } = require('../models/auth');
// const crypto = require('crypto');
// const multer = require('multer');

module.exports = (upload) => {
  const router = express.Router();
  // router.use(sessionMiddleware);

  // load the donation page
  router.get('/', (req, res) => {
    res.send(dots.createPost());
  });


  router.post('/submit', upload.single('photo'), async (req, res) => {
    console.log('REQ.BODY:', req.body);
      console.log('REQ.FILE:', req.file);
    try {
      // retrieving the text inputs
      const { title, category, content } = req.body;
      if (!title || !category || !content) {
        return res.status(400).send('Title, category, content required.');
      }

      // Build image_url if file was uploaded
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      // Insert data onto the database
      await pool.query(
        `INSERT INTO posts (title, category, content, image_url)
         VALUES ($1,$2,$3,$4)`,
        [title, category, content, imageUrl]
      );

      // Redirect to confirmation
      res.redirect('/create-post/submit');
    } catch (err) {
      console.error('Create Post Error:', err);
      res.status(500).send('Could not create post.');
    }
  }
  );

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
