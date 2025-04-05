const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const app = express()
const port = 3000

// Importing routes for login & register
const { registerUser, loginUser } = require('./routes/auth'); 

dotenv.config();


app.use(express.static(path.join(__dirname, 'public')));

// For parsing JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Import Routes */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);
var getPostRouter = require('./routes/post');
app.use('/get-posts', getPostRouter)

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});


// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await loginUser(username, password);
        if (result.success) {
            res.json({ message: 'You are logged in!' });
        } else {
            res.status(401).json({ message: 'Username and/or password is incorrect!' });
        }
    } catch (error) {
        console.error('Error during login:', error);
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