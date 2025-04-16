const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express()
const port = 3000

// Importing routes for login & register
const { registerUser, loginUser, sessionMiddleware } = require('./routes/auth'); 
const { createSession, deleteSession } = require('./routes/session');

dotenv.config();


app.use(express.static(path.join(__dirname, 'public')));

// For parsing JSON and form data
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

/* Import Routes */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);
var getPostRouter = require('./routes/post');
app.use('/get-posts', getPostRouter)
const donateRouter = require('./routes/donate');
app.use('/donate', donateRouter);
const profileRouter = require('./routes/profile'); // for user profile routes
app.use('/profile', profileRouter);

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', sessionMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});


// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await loginUser(username, password);
        if (!result.success) return res.status(401).json({ message: 'Invalid credentials' });

        const { token, expiresAt } = await createSession(result.userId);

        res.cookie('session_token', token, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000
        });

        res.json({ message: 'You are logged in!' });
    } catch (error) {
        console.error('Error during login route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await registerUser(username, password);
        if (result.success) {
            res.json({ message: 'You have registered successfully!' });
        } else {
            res.status(400).json({ message: 'Error registering user' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/profile/get-user-profile', sessionMiddleware, async (req, res) => {
    try {
        const user = await getUserById(req.userId); // req.userId was set in the session middleware

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
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
        await deleteSession(token, userId);
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