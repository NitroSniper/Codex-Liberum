const path = require('path')
const express = require('express')
const app = express()
const port = 3000


/* Import Routes */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);


app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
