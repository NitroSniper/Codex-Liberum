const express = require('express');
const { pool } = require('../db/db');
const router = express.Router();
const { objectIsEmpty } = require('../models/util')
let dots = require("../views/dots")

router.get('/', (req, res) => {
  console.log(req.csrfToken())
  res.send(dots.createPost({csrf: req.csrfToken() }));
});

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

// to create post
router.get('/create-post', async (req, res) => {

    const { title, category, content, photo } = req.body;
    if (objectIsEmpty(req.session)) 
        return res.status(400).send(dots.message({message:"Forbidden"}))
    const user = !objectIsEmpty(req.session);
    const createdBy = user.userID;
    const baseIP = process.env.UPLOADS_IP;
    const basePORT = process.env.UPLOADS_PORT;
    const uploadsSecret = process.env.UPLOADS_SECRET;

    // get the data from the form
    if (!title || !category || !content) {
        return res.status(400).send('Title, category, content required.');
    }

    // send the image data to uplods subdomain
    let imageUrl = null;
    if (photo) {
        try {
            const uploadRes = await fetch('http://uploads:3001/uploads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Uploads-Secret': uploadsSecret
                },
                body: JSON.stringify({ photo })
            });

            if (!uploadRes.ok) {
                console.error('Upload service error:', uploadRes.status, await uploadRes.text());
                return res.status(uploadRes.status).send('Image upload failed.');
            }

            const { path } = await uploadRes.json();
            imageUrl = `${baseIP}${basePORT}${path}`;
        } catch (err) {
            console.error('Error calling uploads service:', err);
            return res.status(502).send('Image upload failed.');
        }
    }
    // const url = await fetch("https://uploads:3001/uploads")

    // save data onto the db
    try {
        await pool.query(
            `INSERT INTO posts (title, category, content, image_url, created_by)
           VALUES ($1,$2,$3,$4,$5)`,
            [title, category, content, imageUrl, createdBy]
        );
        res.redirect('/submit');
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(500).send('Could not create post.');
    }
});

router.get('/submit', (req, res) => {
  // put this html in a .dot file
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

module.exports = router;