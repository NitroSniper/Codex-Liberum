const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
/* GET home page. */
router.get('/', (req, res) => {
  if (req.session === null || !req.session.isModerator) return res.status(401).send('Insufficient Permission');
  res.send(dots.moderator());
})

module.exports = router;
