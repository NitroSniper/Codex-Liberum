const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const { objectIsEmpty } = require('../models/util')

const { query } = require("../db/db");
/* GET home page. */
router.get('/', (req, res) => {
    if (objectIsEmpty(req.session) || !req.session.isModerator) return res.status(401).send(dots.message({ message: 'Forbidden: Insufficient Permission' }));
    res.send(dots.moderator({ csrf: req.csrfToken() }));
})


router.get('/unverified-users', async (req, res) => {
    if (objectIsEmpty(req.session) || !req.session.isModerator) return res.status(401).send(dots.message({ message: 'Forbidden: Insufficient Permission' }));

    try {
        const result = await query('SELECT id, username FROM users WHERE isverified = false ORDER BY username');
        console.log(result);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching unverified users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/verify-users', async (req, res) => {
    if (objectIsEmpty(req.session)) {
        return res.status(403).send(dots.message({ message: 'Forbidden' }));
    }

    const { userIds } = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid input' });

    try {
        await query('UPDATE users SET isverified = true WHERE id = ANY($1)', [userIds]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error verifying users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// for loading the post title to the moderator page
router.get(
    '/posts', async (req, res) => {
        if (objectIsEmpty(req.session) || !req.session.isModerator) return res.status(401).send(dots.message({ message: 'Forbidden: Insufficient Permission' }));
        try {
            const rows = await query( 'SELECT id, title FROM posts ORDER BY created DESC');
            console.log(rows);
            res.json(rows.rows);
        } catch (err) {
            console.error('Could not fetch posts:', err);
            res.status(500).json({ error: 'Failed to load posts' });
        }
    }
);

// for deleting post
router.post(
    '/delete-posts', async (req, res) => {
        const { postIds } = req.body;
        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ message: 'No posts selected' });
        }
        try {
            await query(
                'DELETE FROM posts WHERE id = ANY($1::int[])',
                [postIds]
            );
            res.json({ success: true });
        } catch (err) {
            console.error('Delete Posts Error:', err);
            res.status(500).json({ message: 'Could not delete posts' });
        }
    }
);
// router.delete(
//     '/post/:id', async (req, res) => {
//       const postId = req.params.id;
//       try {
//         const result = await query(
//           'DELETE FROM posts WHERE id = $1 RETURNING id',
//           [postId]
//         );
//         if (result.rowCount === 0) {
//           return res.status(404).json({ error: 'Post not found' });
//         }
//         res.json({ success: true, deletedId: postId });
//       } catch (err) {
//         console.error('Delete Post Error:', err);
//         res.status(500).json({ error: 'Could not delete post' });
//       }
//     }
//   );

module.exports = router;
