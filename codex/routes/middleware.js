const express = require('express');
const path = require("path");
const router = express.Router();
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const { verifySession } = require("../models/auth");


router.use(bodyParser.json());
router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));
// HTTPS logging
router.use(morgan('combined'))

// https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html and https://www.npmjs.com/package/helmet
// Set these headers for all server responses, Chose OWASP over helmet in some scenarios
router.use((req, res, next) => {
    // // Legacy header that mitigates clickjacking attacks
    // res.setHeader('X-Frame-Options', 'DENY');
    // // Legacy header that tries to mitigate XSS attacks, but makes things worse
    // res.setHeader('X-XSS-Protection', '0');
    // // Avoids MIME sniffing
    // res.setHeader('X-Content-Type-Options', 'nosniff');
    // // Controls the Referer header
    // res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // // set the original media type of the resource (which is mostly html)
    // res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    // // Tells browsers to prefer HTTPS
    // res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // // A powerful allow-list of what can happen on your page which mitigates many attacks
    // res.setHeader('Content-Security-Policy', 'default-src \'self\';base-uri \'self\';font-src \'self\' https: data:;form-action \'self\';frame-ancestors \'self\';img-src \'self\' data:;object-src \'none\';script-src \'self\';script-src-attr \'none\';style-src \'self\' https: \'unsafe-inline\';upgrade-insecure-requests');
    // // Indicate what origins are allowed to access the site
    // res.setHeader('Access-Control-Allow-Origin', 'https://localhost');
    // // Helps process-isolate your page
    // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    // // Optional, prevents a document from loading any cross-origin document unless given permission via CORP or CORS
    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    // // Blocks others from loading your resources cross-origin
    // res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    // // Prevents a possible XSS attacks from enabling permissions
    // res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), interest-cohort=()');
    // // naive way of hiding the fingerprint of the server
    // res.setHeader('Server', 'webserver');
    // // Controls DNS prefetching which sacrifice performance for privacy
    // res.setHeader('X-DNS-Prefetch-Control', 'off');
    // // Changes to allow web apps to isolate their origins from other processes
    // res.setHeader('Origin-Agent-Cluster', '?1');
    // // Only for IE forcing downloads to be saved mitigating execution of HTML
    // res.setHeader('X-Download-Options', 'noopen')
    // // Controls cross-domain behavior for Adobe products, like Acrobat
    // res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
    next()
})
router.use(verifySession);

module.exports = router;
