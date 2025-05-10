const express = require('express');
const {objectIsEmpty} = require('../models/util')
const router = express.Router();
let dots = require("../views/dots")
/* GET home page. */
router.get('/', (req, res) => {
    console.log("Index", req.headers['x-csrf-token']);
    const logout = !objectIsEmpty(req.session);
    const moderator = logout && req.session.isModerator;
    const verified = logout && req.session.isVerified;

    console.log(req.csrfToken())
    res.send(dots.index({logout: logout, moderator: moderator, verified: verified, csrf: req.csrfToken()}));
})

module.exports = router;
