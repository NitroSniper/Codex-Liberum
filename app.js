const path = require('path')
const express = require('express')
const app = express()
const port = 3000


let dots = require("./views/dots")

app.get('/', (req, res) => {
  res.send(dots.index());
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
