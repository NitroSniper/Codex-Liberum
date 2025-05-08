const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express()
const port = 3000
const multer = require('multer');
const morgan = require('morgan');

const { sessionMiddleware } = require('./models/auth');

// Importing routes for login & register



app.use(express.static(path.join(__dirname, 'public')));
// Define routes that are public
app.use("css", express.static(path.join(__dirname, 'public', 'css')));
app.use("js", express.static(path.join(__dirname, 'public', 'js')));


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


// HTTPS logging
app.use(morgan('combined'))

// https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html and https://www.npmjs.com/package/helmet
// Set these headers for all server responses, Chose OWASP over helmet in some scenarios
app.use((req, res, next) => {
    // Legacy header that mitigates clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');
    // Legacy header that tries to mitigate XSS attacks, but makes things worse
    res.setHeader('X-XSS-Protection', '0');
    // Avoids MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Controls the Referer header
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // set the original media type of the resource (which is mostly html)
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    // Tells browsers to prefer HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // A powerful allow-list of what can happen on your page which mitigates many attacks
    res.setHeader('Content-Security-Policy', 'default-src \'self\';base-uri \'self\';font-src \'self\' https: data:;form-action \'self\';frame-ancestors \'self\';img-src \'self\' data:;object-src \'none\';script-src \'self\';script-src-attr \'none\';style-src \'self\' https: \'unsafe-inline\';upgrade-insecure-requests');
    // Indicate what origins are allowed to access the site
    res.setHeader('Access-Control-Allow-Origin', 'https://localhost');
    // Helps process-isolate your page
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    // Optional, prevents a document from loading any cross-origin document unless given permission via CORP or CORS
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    // Blocks others from loading your resources cross-origin
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    // Prevents a possible XSS attacks from enabling permissions
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), interest-cohort=()');
    // naive way of hiding the fingerprint of the server
    res.setHeader('Server', 'webserver');
    // Controls DNS prefetching which sacrifice performance for privacy
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    // Changes to allow web apps to isolate their origins from other processes
    res.setHeader('Origin-Agent-Cluster', '?1');
    // Only for IE forcing downloads to be saved mitigating execution of HTML
    res.setHeader('X-Download-Options', 'noopen')
    // Controls cross-domain behavior for Adobe products, like Acrobat
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
    next()
})
app.disable("x-powered-by");


/* Import Routes */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);
var getPostRouter = require('./routes/post');
app.use('/post', getPostRouter)
const donateRouter = require('./routes/donate');
app.use('/donate', donateRouter);
const profileRouter = require('./routes/profile'); // for user profile routes
app.use('/profile', profileRouter);
const createPost = require('./routes/createPost');
app.use('/create-post', createPost(upload));
const moderatorRoutes = require('./routes/moderator');
app.use('/moderator', moderatorRoutes);
const authentication = require('./routes/authentication');
app.use('/auth', authentication);


app.get('/dashboard', sessionMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
// app.get('/create-post', sessionMiddleware, (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'createPost.html'));
// });

app.get('/moderator', sessionMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'moderator.html'));
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