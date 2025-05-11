const express = require('express');
const { query } = require('../db/db');
const router = express.Router();
const { objectIsEmpty } = require('../models/util')

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

    const { title, category, content, photoUrl } = req.body;
    const user = !objectIsEmpty(req.session);
    const createdBy = user.userID;
    const baseUrl = process.env.codex_BASE_URL;
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
            imageUrl = `${baseUrl}${path}`;
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
        res.redirect('/create-post/submit');
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(500).send('Could not create post.');
    }
});

module.exports = router;