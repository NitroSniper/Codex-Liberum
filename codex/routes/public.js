const express = require('express');
const path = require("path");
const router = express.Router();

/* GET home page. */
router.use("/css", express.static(path.join(__dirname, '..', 'public', 'css')));
router.use("/view", express.static(path.join(__dirname, '..', 'views', 'client')));
router.use("/js", express.static(path.join(__dirname, '..', 'public', 'js')));

module.exports = router;
