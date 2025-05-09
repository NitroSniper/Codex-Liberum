const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
/* GET home page. */
router.get('/', (req, res) => {
  console.log("Index", req.session)
  const logout = req.session !== null;
  const moderator = logout && req.session.isModerator;
  const verified = logout && req.session.isVerified;

  res.send(dots.index({logout: logout, moderator: moderator, verified: verified}));
})

module.exports = router;
