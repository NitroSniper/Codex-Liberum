const crypto = require('crypto');
const { pool } = require('../db/db');

// getSession from session module
const { getSession } = require('./session');

// Secret pepper
const pepper = 'my_secret_pepper'; 

// Using crypto function to generate a salt
function generateSalt() {
    return crypto.randomBytes(16).toString('hex'); // Using 16-byte salt in hexadecimal
}

// Using crypto function (SHA256) to hash the password with the salt and pepper
function hashPassword(password, salt) {
    const passwordWithSaltAndPepper = salt + password + pepper;
    return crypto.createHash('sha256')
        .update(passwordWithSaltAndPepper)
        .digest('hex');
}

// Function to verify the password
async function verifyPassword(storedHash, enteredPassword, storedSalt) {
    const enteredHashedPassword = hashPassword(enteredPassword, storedSalt);
    return storedHash === enteredHashedPassword;
}

// Register a new user 
async function registerUser(username, password) {
    try {
        // Generate a salt
        const salt = generateSalt();
        // Hash the password and salt
        const hashedPassword = hashPassword(password, salt);

        const query = 'INSERT INTO users (username, salt, hashed_password) VALUES ($1, $2, $3) RETURNING id';
        const result = await pool.query(query, [username, salt, hashedPassword]);

        return { success: true, message: "User registered successfully!", userId: result.rows[0].id };
    } catch (error) {
        console.error("Error during user registration:", error);
        return { success: false, message: "Error registering user" };
    }
}

// Authenticate a user during login
async function loginUser(username, password) {
    try {
        const query = 'SELECT id, salt, hashed_password FROM users WHERE username = $1';
        const { rows } = await pool.query(query, [username]);

        if (rows.length === 0) {
            return { success: false, message: "Invalid username or password" };
        }

        const user = rows[0];
        const passwordValid = await verifyPassword(user.hashed_password, password, user.salt);

        if (passwordValid) {
            return { success: true, message: "Login successful!", userId: user.id };
        } else {
            return { success: false, message: "Invalid username or password" };
        }
    } catch (error) {
        console.error("Error during login:", error);
        return { success: false, message: "Error during login process" };
    }
}

//Sessions
async function sessionMiddleware(req, res, next) {
    try {
        const token = req.cookies.session_token;

        if (!token) {
            return handleSessionFail(req, res);
        }

        const session = await getSession(token);

        if (!session) {
            return handleSessionFail(req, res);
        }

        req.userId = session.user_id;
        next();
    } catch (error) {
        console.error('Session middleware error:', error);
        return handleSessionFail(req, res);
    }
}

function handleSessionFail(req, res) {
    // Check if the request is an API call 
    if (req.originalUrl.startsWith('/profile') || req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'Session expired' });
    } else {
        return res.redirect('/login');
    }
}

async function getUserById(userId) {
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
    return result.rows[0];
}

module.exports = {
    registerUser,
    loginUser,
    sessionMiddleware,
    getUserById

};
