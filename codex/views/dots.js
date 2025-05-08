const path = require('path');
// Compile client templates
require("dot").process({
  path: path.join(__dirname, "client"),
})

// Compile server templates
const dots = require("dot").process({
  path: path.join(__dirname, "server"),
});


module.exports = dots
