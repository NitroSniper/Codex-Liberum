const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express()
const port = 3000
const multer = require('multer');

// Importing routes for login & register
const { registerUser, loginUser, sessionMiddleware } = require('./models/auth');
const { createSession } = require('./models/session');


dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));
// Define routes that are public
app.use("css", express.static(path.join(__dirname, 'public', 'css')));


// For parsing JSON and form data
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// set a multer destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads'));
        // cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().valueOf() + '_' + file.originalname);
    }
});


const upload = multer({
    dest:'./public/uploads'
});

app.post('/stats', upload.single('uploaded_file'), function (req, res) {
    // req.file is the name of your file in the form above, here 'uploaded_file'
    // req.body will hold the text fields, if there were any 
    console.log(req.file, req.body)
  });


// to check the extension and MIME type as well as the file size limit
// const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//         const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
//         const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
//         const ext = path.extname(file.originalname).toLowerCase();

//         if (!allowedExts.includes(ext)) {
//             return cb(new Error('Only JPG, PNG & GIF are allowed'), false);
//         }
//         if (!allowedMimes.includes(file.mimetype)) {
//             return cb(new Error('Invalid MIME type'), false);
//         }
//         cb(null, true);
//     },
//     limits: { fileSize: 2 * 1024 * 1024 } // 2MB
// });


// const upload = multer({
//     dest:'uploads/'
// })

app.use('/uploads',
    express.static(path.join(__dirname, 'public', 'uploads'))
);


/* Import Routes */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);
var getPostRouter = require('./routes/post');
app.use('/get-posts', getPostRouter)
const donateRouter = require('./routes/donate');
app.use('/donate', donateRouter);
const profileRouter = require('./routes/profile'); // for user profile routes
app.use('/profile', profileRouter);
const createPost = require('./routes/createPost');
app.use('/create-post', createPost(upload));
const moderatorRoutes = require('./routes/moderator');
app.use('/moderator', moderatorRoutes);

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', sessionMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
// app.get('/create-post', sessionMiddleware, (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'createPost.html'));
// });

app.get('/moderator', sessionMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'moderator.html'));
});

// Login Route 
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const loginResult = await loginUser(username, password);

        if (!loginResult.success) {
            return res.status(401).json({
                success: false,
                message: loginResult.message || 'Invalid credentials',
            });
        }

        // Create session token and set cookie
        const { token, expiresAt } = await createSession(loginResult.userId);

        res.cookie('session_token', token, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Login successful!',
            ismoderator: loginResult.ismoderator,
        });

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