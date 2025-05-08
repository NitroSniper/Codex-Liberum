const express = require('express');
const path = require('path');
const app = express()
const port = 3000
const multer = require('multer');

const { sessionMiddleware } = require('./models/auth');

/* Import Routes */
const middlewareRouter = require('./routes/middleware');
app.use(middlewareRouter);
app.disable("x-powered-by");
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const getPostRouter = require('./routes/post');
app.use('/post', getPostRouter)
const donateRouter = require('./routes/donate');
app.use('/donate', donateRouter);
const profileRouter = require('./routes/profile'); // for user profile routes
app.use('/profile', profileRouter);
const createPost = require('./routes/createPost');
app.use('/create-post', createPost);
const moderatorRoutes = require('./routes/moderator');
app.use('/moderator', moderatorRoutes);
const authentication = require('./routes/authentication');
app.use('/auth', authentication);
const pub = require('./routes/public');
app.use('/public', pub);
const verification = require('./routes/verification');
app.use('/auth', verification);


app.get('/dashboard', sessionMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
// app.get('/create-post', sessionMiddleware, (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'createPost.html'));
// });



app.get('/profile/get-user-profile', sessionMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         id,
         username,
        isverified,
        ismoderator
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // return the full row
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Logout Route
// Passes userId 
app.post('/logout', sessionMiddleware, async (req, res) => {
    const token = req.cookies.session_token;
    const userId = req.userId;

    if (!token) {
        return res.status(400).json({ message: 'No session found' });
    }

    try {
        res.clearCookie('session_token');
        res.json({ message: 'You have logged out successfully!' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// For undefined routes
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Reason - https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Docker_Cheat_Sheet.html#6-graceful-tear-down-for-your-nodejs-web-applications
async function closeGraceful(signal) {
    console.log(`Received signal to terminate: ${signal}`)

    await server.close(() => {
        console.log("Server terminated.");
        process.exit(0);
    });
}

process.on('SIGINT', closeGraceful);
process.on('SIGTERM', closeGraceful);