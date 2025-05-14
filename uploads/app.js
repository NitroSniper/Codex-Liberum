const express = require('express')
const app = express()
const port = 3001
const multer = require('multer');
const path = require('path');
const logger = require('./models/logger');
const { log } = require('console');

app.get('/', (req, res) => {
  logger.info('test');
  res.send('Hello World!')
})

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

app.use((req, res, next) => {
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.set('Access-Control-Allow-Origin', 'https://liberum.ortin.dev');
    next()
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only JPG, PNG & GIF extensions allowed'), false);
    }
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid MIME type'), false);
    }
    cb(null, true);
  }
});

// the endpoint of upload
app.post(
  '/upload',
  upload.single('image'),
  (req, res) => {
    const provided = req.get('X-Uploads-Secret');
    const expected = process.env.UPLOADS_SECRET;
    if (!provided || provided !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // const fileUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    const fileUrl = `https://upload.ortin.dev/images/${req.file.filename}`;
    // res.json({ url: fileUrl });
    res.json({ path: `${fileUrl}` })
  }
);

// check if the root is still running
app.get('/', (_req, res) => {
  res.send('Upload service is running');
});

// handle an error
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message });
});
app.use("/images", express.static(path.join(__dirname, 'public', 'images')));


const server = app.listen(port, () => {
  logger.info(`app listening on port ${port}`)
})

// Reason - https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Docker_Cheat_Sheet.html#6-graceful-tear-down-for-your-nodejs-web-applications
async function closeGraceful(signal) {
    logger.info(`Received signal to terminate: ${signal}`)

    await server.close(() => {
        logger.info("Server terminated.");
        process.exit(0);
    });
}
