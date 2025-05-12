const express = require('express');
let dots = require("../views/dots")
const router = express.Router();
const {createSession} = require('../models/session');
const {registerUser, loginUser} = require('../models/auth');
const {objectIsEmpty} = require("../models/util");
const {timingMitigationMiddleware} = require("./middleware");
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { query } = require('../db/db');

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
router.post('/login', timingMitigationMiddleware, async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await loginUser(username, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // If user has already enabled 2FA
        if (user.two_factor_enabled) {
            const sessionToken = await createSession(req, user.id);
            res.cookie('session_token', sessionToken, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('pending_2fa', user.id, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: 5 * 60 * 1000,
            });
            return res.json({
                requires2FA: true,
                redirectTo: '/auth/verify-2fa' // redirect to verify
            });
        }
        // If user has not enabled 2FA, create a session and redirect to 2FA setup
        const token = await createSession(req, user.id);
        res.cookie('session_token', token, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000,
        });
        return res.json({
            message: 'Redirecting to 2FA setup',
            redirectTo: '/auth/setup-2fa' // redirect to setup
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/* GET setup 2FA page. */
router.get('/setup-2fa', async (req, res) => {
    if (objectIsEmpty(req.session)) return res.redirect('login');
    const secret = speakeasy.generateSecret({
        name: `Codex Liberum (${req.session.userID})`
    });
    // save temporary secret in DB
    await query(`
        UPDATE users SET two_factor_temp_secret = $1 WHERE id = $2
    `, [secret.base32, req.session.userID]);
    // generate QR code image as a data URL
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) {
            console.error('QR Code generation error:', err);
            return res.status(500).send('Failed to generate QR code');
        }
        // to render the setup2fa.dot template with the QR code image
        res.send(dots.setup2factor({
            qrImage: dataUrl, 
            secret: secret.base32,
            csrf: req.csrfToken()
        }));
    });
});

/* POST setup 2FA page */
router.post('/setup-2fa', async (req, res) => {
    console.log('POST /setup-2fa hit');
    const { token } = req.body;
    const userId = req.session.userID;
    const { two_factor_temp_secret: tempSecret } = (await query(`SELECT two_factor_temp_secret FROM users WHERE id = $1`, [userId])).rows[0] || {};

    // For testing 
    console.log('2fa:');
    console.log('Temporary secret:', tempSecret);
    console.log('User entered token:', token);
    console.log('Server expects:', speakeasy.totp({secret: tempSecret, encoding: 'base32'}));

    const verified = speakeasy.totp.verify({
        secret: tempSecret, 
        encoding: 'base32', 
        token, 
        window: 1
    });

    if (verified) {
        // if successful - enable and redirect
        await query(`UPDATE users SET two_factor_secret = $1, two_factor_enabled = TRUE, two_factor_temp_secret = NULL WHERE id = $2`,[tempSecret, req.session.userID]);
        return res.redirect('/');
    }
    // if failed - regenerate the QR and re-render
    const otpauthURL = speakeasy.otpauthURL({
        secret: tempSecret,
        label: `Codex Liberum (${req.session.userID})`,
        encoding: 'base32'
    });
    QRCode.toDataURL(otpauthURL, (err, qrDataUrl) => {
        if (err) {
            console.error('Error regenerating QR:', err);
            return res.status(500).send('Failed to generate QR code');
        }
        // render setup page with error, QR, and secret
        res.send(dots.setup2factor({
            error: 'Invalid 2FA code, please try again.',
            qrImage: qrDataUrl,
            secret: tempSecret,
            csrf: req.csrfToken()
        }));
    });
});


/* GET verify 2FA page */
router.get('/verify-2fa', (req, res) => {
    if (!req.cookies.pending_2fa) {
        return res.redirect('login');
    }
    console.log('CSRF token:', req.csrfToken()); 
    res.send(dots.verify2factor({ csrf: req.csrfToken() }));
});


/* POST verify 2FA page */
router.post('/verify-2fa', async (req, res) => {
    const { token } = req.body;
    const userId = req.cookies.pending_2fa;
    if (!userId) return res.redirect('login');
  
    // Fetch the permanent secret
    const result = await query('SELECT two_factor_secret FROM users WHERE id = $1',[userId]);
    const user = result.rows[0];
    if (!user || !user.two_factor_secret) {
      return res.redirect('login');
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1
    });
  
    if (!verified) {
      // if failed - re-render with an error
      return res.send(dots.verify2factor({
        error: 'Invalid 2FA code',
        csrf: req.csrfToken()
      }));
    }
    // clear pending_2fa, set the real session, and redirect home
    const sessionToken = await createSession(req, userId);
    res.clearCookie('pending_2fa');
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    });
    return res.redirect('/');
  });
  

// Register Route
router.post('/register', timingMitigationMiddleware, async (req, res) => {
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
