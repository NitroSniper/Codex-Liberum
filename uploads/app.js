const express = require('express')
const app = express()
const port = 3001
const multer = require('multer');
const path = require('path');

app.get('/', (req, res) => {
  console.log('test');
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
    const fileUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    // res.json({ url: fileUrl });
    res.json({ path: `/images/${filename}` })
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


app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})