const express = require('express');
const {query} = require('../db/db');
const router = express.Router();
const path = require('path');
const {objectIsEmpty} = require('../models/util')
let dots = require("../views/dots")
const multer = require('multer');

// for file upload 
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 2 * 1024 * 1024}, // 2 MB
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
    }
})

router.get('/blog/:postId', async (req, res) => {
    try{
        const data = await query(
            `SELECT content, title, created, created_by FROM posts WHERE id=$1`, [req.params.postId]    
        );
    if (data.rows.length === 1) {
        console.log("asdfsadfsafsadfsdffsdafsdfdsafds",data.rows.content);
        res.send(dots.post({csrf: req.csrfToken(), post: await json.stringify(data.rows)}))
    } else {
        res.status(404).send(dots.message({csrf: req.csrfToken(), message: "Post Doesn't Exist"}))
    }
} catch (err) {
    console.error('Error with getting post', err);
    res.status(400).send(dots.message({csrf: req.csrfToken(), message: "Bad Request"}))
}
    
});


// get the page
router.get('/create-post', (req, res) => {

    //   console.log(req.csrfToken())
    if (objectIsEmpty(req.session) || !req.session.userID)
        return res.status(400).send(dots.message({message: "Forbidden"}))
    res.send(dots.createPost({csrf: req.csrfToken()}));
});

// get posts from database
router.get('/get-posts', async (req, res) => {
    console.log(req.headers);
    const name = req.query.name;
    const amount = req.query.amount;
    try {
        // const result = await query('SELECT title, username FROM posts INNER JOIN users on posts.created_by = users.id WHERE title LIKE $1 ORDER BY "created" DESC LIMIT $2', [`%${name}%`, amount]);
        const result = await query('SELECT posts.id, title, category, image_url, username FROM posts INNER JOIN users on posts.created_by = users.id WHERE title ILIKE $1 ORDER BY "created" DESC LIMIT $2', [`%${name}%`, amount]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        // should be bad
        res.status(500).json({error: error.message});
    }
});

// to create post
router.post('/create-post', upload.single('photo'), async (req, res) => {

    const {title, category, content} = req.body;
    if (objectIsEmpty(req.session) || !req.session.isVerified)
        return res.status(403).send(dots.message({message: "Forbidden"}))
    // const user = !objectIsEmpty(req.session);
    const createdBy = req.session.userID;
    const baseIP = process.env.UPLOADS_IP;
    const basePort = process.env.UPLOADS_PORT;
    const uploadsSecret = process.env.UPLOADS_SECRET;

    console.log(req.body);
    console.log(req.file)

    // get the data from the form
    if (!title || !category || !content || !req.file) {
        return res.status(400).send('Title, category, content, and thumbnail required.');
    }

    // // Convert to base64 to use JSON
    // let photoBase64 = null;
    // if (req.file) {
    //     photoBase64 = req.file.buffer.toString('base64'); // not sure
    // }

    try {
        let formData = new FormData();
        console.log(typeof req.file.buffer)
        formData.append("image", new File([new Uint8Array(req.file.buffer)], req.file.originalname, { type: 'image/jpeg' }));
        console.log(Object.fromEntries(formData));
        const uploadURLRes = await fetch(`http://${baseIP}:${basePort}/upload`, {
            method: 'POST',
            headers: {
                'X-Uploads-Secret': uploadsSecret
            },
            body: formData
        });

        console.log(uploadURLRes);

        if (!uploadURLRes.ok) {
            console.error('Upload service error:', uploadURLRes.status, await uploadURLRes.text());
            return res.status(uploadURLRes.status).send('Image upload failed.');
        }

        const {path} = await uploadURLRes.json();
        console.log(path);
        // imageUrl = `http://${baseIP}.localhost/${path}`;
        imageUrl = `${path}`;
    } catch (err) {
        console.error('Error calling uploads service:', err);
        return res.status(502).send('Image upload failed.');
    }
    // const url = await fetch("https://uploads:3001/uploads")

    // save data onto the db
    try {
        await query(
            `INSERT INTO posts (title, category, content, image_url, created_by)
             VALUES ($1, $2, $3, $4, $5)`,
            [title, category, content, imageUrl, createdBy]    
        );
        // alert("Successfully created post");
        res.redirect('/');
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(500).send('Could not create post.');
    }
});

module.exports = router;