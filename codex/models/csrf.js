// Code was heavily inspired by https://github.com/Psifi-Solutions/csrf-sync.git
// However this isn't asynchronous and doesn't connect to DB so this is a
// home implementation.
const {query} = require('../db/db')
const {randomBytes} = require("crypto");
const dots = require("../views/dots");
const {objectIsEmpty} = require("./util");

console.log(randomBytes(128).toString("base64"));

const ignoredMethods = [
    "GET", "HEAD", "OPTIONS"
]
const ignoredPaths = [
    // these are paths that use POST but without any authentication
    "/auth/login",
    "/auth/register"
]

const getTokenFromState = (req) => objectIsEmpty(req.session) ? null : req.session.csrfToken;
const getTokenFromRequest = (req) => req.headers['x-csrf-token'];
const isRequestValid = (req) => getTokenFromRequest(req) === getTokenFromState(req);
const generateTokenHash = () => randomBytes(128).toString("base64");
const requiresCSRFProtection = (req) => !(ignoredMethods.includes(req.method) || ignoredPaths.includes(req.path));
function generateToken(req, overwrite) {
    if (!overwrite) return getTokenFromState(req);
    const newToken = generateTokenHash();
    storeTokenInState(req, newToken)
    return newToken;
}

function storeTokenInState(req, csrf_token) {
    req.session.csrfToken = csrf_token
    query('UPDATE sesh SET csrf_token = $2 WHERE session_token = $1', [req.session.token, csrf_token]).then(x => {});
}


function csrfTokenMiddleware(req, res, next) {
    req.csrfToken = (overwrite) => generateToken(req, overwrite);
    console.log(req.headers);
    console.log("Key:",getTokenFromRequest(req), "Value:", getTokenFromState(req) );
    if (!requiresCSRFProtection(req)) {
        // if request doesn't need protection
        next();
    } else if (isRequestValid(req)) {
        // if request has csrf token and is valid
        next();
    } else {
        // failed csrf validation
        return res.status(403).send(dots.message({message: 'Forbidden'}));
    }
}

module.exports = {
    csrfTokenMiddleware,
    generateTokenHash,
}