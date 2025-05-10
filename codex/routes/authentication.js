const express = require('express');
let dots = require("../views/dots")
const router = express.Router();
const {createSession} = require('../models/session');
const {registerUser, loginUser} = require('../models/auth');
const {objectIsEmpty} = require("../models/util");


const minLength = 8;
function isWeakPassword(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length < minLength ||
        !hasUpper ||
        !hasLower ||
        !hasNumber ||
        !hasSpecial
    );
}

/* GET login page. */
router.get('/login', (req, res) => {
    res.send(dots.login({csrf: req.csrfToken()}));
});

/* GET Register page. */
router.get('/register', (req, res) => {
    res.send(dots.register({csrf: req.csrfToken()}));
});

/* POST login page. */
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const loginResult = await loginUser(username, password);

        if (loginResult === null) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        // Create session token and set cookie
        const token = await createSession(req, loginResult);

        res.cookie('session_token', token, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000,
        });

        res.json({
            message: 'Login successful!',
        });

    } catch (error) {
        console.error('Error during login route:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

// Register Route
router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    const genericMessage = `
    Password is too weak/Account already exists!<br>
    Password must be ${minLength}+ characters, include a number, a symbol, and both upper & lower case letters. 
    `
    if (isWeakPassword(password)) return res.status(400).json({message: genericMessage});

    try {
        const result = await registerUser(username, password);
        if (result) {
            res.json({message: 'You have registered successfully!'});
        } else {
            res.status(400).json({message: genericMessage});
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

// Logout Route
// Passes userId
router.post('/logout', async (req, res) => {
    if (objectIsEmpty(req.session)) return res.status(401).send(dots.message({message: "You are not logged in"}));
    try {
        res.clearCookie('session_token');
        res.json({message: 'You have logged out successfully!'});
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

module.exports = router;
