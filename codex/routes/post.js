const express = require('express');
const { pool } = require('../db/db');
const router = express.Router();
const { objectIsEmpty } = require('../models/util')
let dots = require("../views/dots")
const multer = require('multer');

// for file upload 
const storage = multer.memoryStorage()
const upload = multer({ storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only JPG, PNG & GIF extensions allowed'), false);
    }
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid MIME type'), false);
    }
    cb(null, true);
  }} )

// get the page
router.get('/', (req, res) => {

    //   console.log(req.csrfToken())
    if (objectIsEmpty(req.session) || !req.session.userID)
        return res.status(400).send(dots.message({ message: "Forbidden" }))
    res.send(dots.createPost({ csrf: req.csrfToken() }));
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
router.post('/create-post', async (req, res) => {
    console.log(req.body);

    const { title, category, content} = req.body;
    if (objectIsEmpty(req.session) || !req.session.userID)
        return res.status(403).send(dots.message({ message: "Forbidden" }))
    // const user = !objectIsEmpty(req.session);
    const createdBy = req.session.userID;
    const baseIP = process.env.UPLOADS_IP;
    const basePORT = process.env.UPLOADS_PORT;
    const uploadsSecret = process.env.UPLOADS_SECRET;


    // get the data from the form
    if (!title || !category || !content) {
        return res.status(400).send('Title, category, content required.');
    }

    // Convert to base64 to use JSON
    let photoBase64 = null;
    if (req.file) {
      photoBase64 = req.file.buffer.toString('base64'); // not sure 
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
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(500).send('Could not create post.');
    }
});

module.exports = router;