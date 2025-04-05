const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
/* GET home page. */
router.get('/', (req, res) => {
  res.send(dots.index());
})

module.exports = router;
