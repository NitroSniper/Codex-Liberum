const { randomBytes } = require('crypto');

// generate the password
console.log(randomBytes(512).toString('base64'));

const uploadsSecret = Buffer.from(process.env.UPLOADS_SECRET, 'base64');

// const providedB64 = req.get('X-Uploads-Secret') || '';
// const provided = Buffer.from(providedB64, 'base64');

// if (
//   provided.length !== uploadsSecret.length ||
//   !crypto.timingSafeEqual(provided, uploadsSecret)
// ) {
//   return res.status(401).json({ error: 'Unauthorized' });
// }
