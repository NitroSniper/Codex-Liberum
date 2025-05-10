const express = require('express');
const path = require("path");
const router = express.Router();
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const { verifySession } = require("../models/auth");
const {csrfTokenMiddleware} = require("../models/csrf");
const { RateLimiterMemory, BurstyRateLimiter} = require("rate-limiter-flexible");
const dots = require("../views/dots");




router.use(bodyParser.json());
router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));
// HTTPS logging
router.use(morgan('combined'))

// timing attack mitigations

const minDurationMs = 500 // 500 ms
const timingMitigationMiddleware = (req, res, next) => {
    const start = Date.now()
    const oldEnd = res.end
    res.end = function(...args) {
        const remaining = start - Date.now() + minDurationMs;

        if (remaining > 0) {
            setTimeout( () => {oldEnd.apply(res, args)}, remaining)
        } else {
            oldEnd.apply(res, args);
        }
    }
    next()
};

opts = {
    continuous: {
        points: 4,
        duration: 1
    },
    burst: {
        keyPrefix: 'burst',
        points: 20,
        duration: 10
    }
}
const ignoredPaths = [
    "/public/css/pico.min.css"
]
const requiresRateProtection = (req) => !(ignoredPaths.includes(req.path));

// limits traffic to 2 requests per second with additional allowance of traffic burst up to 5 requests per 10 seconds.
const rateLimiter = new BurstyRateLimiter(
        new RateLimiterMemory({
            points: 3,
            duration: 1,
        }),
        new RateLimiterMemory({
            keyPrefix: 'burst',
            points: 20,
            duration: 10,
        })
    );


const timeRemaining = (res) => Math.ceil((Date.now() + res.msBeforeNext) / 1000);
const rateInfoHeader = (res, rateLimiterRes) => {
    res.set("Retry-After", rateLimiterRes.msBeforeNext / 1000);
    res.set("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
    res.set("X-RateLimit-Reset", timeRemaining(res));
};

router.use((req, res, next) => {
    if (!requiresRateProtection(req)) return next()
    rateLimiter.consume(req.ip)
        .then((rateLimiterRes) => {
            // if not timed out
            rateInfoHeader(res, rateLimiterRes);
            next();
        })
        .catch((rateLimiterRes) => {
            // if now marked as rate limiting
            rateInfoHeader(res, rateLimiterRes);
            res.status(429).send(dots.message({message: `Too Many Requests.`}));
        });
});

// https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html and https://www.npmjs.com/package/helmet
// Set these headers for all server responses, Chose OWASP over helmet in some scenarios
router.use((req, res, next) => {
    // Legacy header that mitigates clickjacking attacks
    res.set('X-Frame-Options', 'DENY');
    // Legacy header that tries to mitigate XSS attacks, but makes things worse
    res.set('X-XSS-Protection', '0');
    // Avoids MIME sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    // Controls the Referer header
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    // set the original media type of the resource (which is mostly html) (Breaks because
    // res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    // Tells browsers to prefer HTTPS
    res.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // A powerful allow-list of what can happen on your page which mitigates many attacks
    res.set('Content-Security-Policy', 'default-src \'self\';base-uri \'self\';font-src \'self\' https: data:;form-action \'self\';frame-ancestors \'self\';img-src \'self\' data:;object-src \'none\';script-src \'self\';script-src-attr \'unsafe-inline\';style-src \'self\' https: \'unsafe-inline\';upgrade-insecure-requests');
    // Indicate what origins are allowed to access the site
    res.set('Access-Control-Allow-Origin', 'https://localhost');
    // Helps process-isolate your page
    res.set('Cross-Origin-Opener-Policy', 'same-origin');
    // Optional, prevents a document from loading any cross-origin document unless given permission via CORP or CORS
    res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    // Blocks others from loading your resources cross-origin
    res.set('Cross-Origin-Resource-Policy', 'same-site');
    // Prevents a possible XSS attacks from enabling permissions
    res.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), interest-cohort=()');
    // naive way of hiding the fingerprint of the server
    res.set('Server', 'webserver');
    // Controls DNS prefetching which sacrifice performance for privacy
    res.set('X-DNS-Prefetch-Control', 'off');
    // Changes to allow web apps to isolate their origins from other processes
    res.set('Origin-Agent-Cluster', '?1');
    // Only for IE forcing downloads to be saved mitigating execution of HTML
    res.set('X-Download-Options', 'noopen')
    // Controls cross-domain behavior for Adobe products, like Acrobat
    res.set('X-Permitted-Cross-Domain-Policies', 'none')

    next()
})
router.use(verifySession);
router.use(csrfTokenMiddleware)

module.exports = {router, timingMitigationMiddleware};
