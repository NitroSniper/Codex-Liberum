const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const path = require("path");
/* GET home page. */
router.get('/login', (req, res) => {
  res.send(dots.login())
});

router.get('/register', (req, res) => {
  res.send(dots.register())
});

module.exports = router;
