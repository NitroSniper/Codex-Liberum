const path = require('path')
const express = require('express')
const app = express()
const port = 3000

app.use("/static",express.static(path.join(__dirname, 'public')));

/* Import Routes */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);
var getPostRouter = require('./routes/post');
app.use('/get-posts', getPostRouter)

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
