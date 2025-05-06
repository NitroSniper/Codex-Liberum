const express = require('express');
let dots = require("../views/dots")
const router = express.Router();
const { createSession } = require('../models/session');
const { registerUser, loginUser, sessionMiddleware } = require('../models/auth');

/* GET login page. */
router.get('/login', (req, res) => {
  res.send(dots.login())
});

/* GET Register page. */
router.get('/register', (req, res) => {
  res.send(dots.register())
});

/* POST login page. */
router.post('/login', async (req, res) => {
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
router.post('/register', async (req, res) => {
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

module.exports = router;
