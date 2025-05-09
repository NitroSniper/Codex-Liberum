const crypto = require('crypto');
const {query} = require('../db/db');
const argon2 = require('argon2');

// Reason - https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
const argon_opts = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    hashLength: 64,
    timeCost: 4, // iteration,
    parallelism: 4,
    secret: Buffer.from(process.env.ARGON_PEPPER)
};


// getSession from session module
const {getSession} = require('./session');

// // Secret pepper
// const pepper = 'my_secret_pepper';

// // Using crypto function to generate a salt
// function generateSalt() {
//     return crypto.randomBytes(16).toString('hex'); // Using 16-byte salt in hexadecimal
// }
//
// // Using crypto function (SHA256) to hash the password with the salt and pepper
// function hashPassword(password, salt) {
//     // salt is unneeded since argon2 does salting under the hood
//     const hashed_password = argon2.hash(password, argon_opts);
//     return crypto.createHash('sha256')
//         .update(passwordWithSaltAndPepper)
//         .digest('hex');
// }
//
// // Function to verify the password
// async function verifyPassword(storedHash, enteredPassword, storedSalt) {
//     const enteredHashedPassword = hashPassword(enteredPassword, storedSalt);
//     return storedHash === enteredHashedPassword;
// }

//Register user
async function registerUser(username, password) {

    const hash = await argon2.hash(password, argon_opts);
    try {
        await query(`INSERT INTO users (username, hashed_password, isverified, ismoderator)
                     VALUES ($1, $2, $3, $4)`, [username, hash, false, false]);
        return true
    } catch (error) {
        console.error("Error during user registration:", error);
        return false
    }
}

// Authenticate a user during login
async function loginUser(username, password) {
    try {
        const result = await query('SELECT id, hashed_password, ismoderator FROM users WHERE username = $1', [username]);
        const rows = result.rows;
        if (rows.length === 0) {
            return null; // give generic error msg
        }
        const user = rows[0];
        if (await argon2.verify(user.hashed_password, password, argon_opts)) {
            return user.id;
        }
    } catch (error) {
        console.error("Error during user login:", error);
    }
    return null;
}


async function verifySession(req, res, next) {
    try {
        req.session = null
        if (req.cookies === undefined || req.cookies.session_token === undefined) return next();
        const session = await getSession(req.cookies.session_token)
        if (!session) return next()
        req.session = {
            userID: session.user_id,
            isModerator: session.ismoderator,
            isVerified: session.isVerified,
        }
        next()
    } catch (error) {
        // session shouldn't be set if there is an error since it is set at the end
        console.error('Session middleware error:', error);
        next()
    }
}


// //Sessions
// async function sessionMiddleware(req, res, next) {
//     try {
//         const token = req.cookies.session_token;
//
//         if (!token) {
//             return handleSessionFail(req, res);
//         }
//
//         const session = await getSession(token);
//
//         if (!session) {
//             return handleSessionFail(req, res);
//         }
//
//         req.userId = session.user_id;
//         req.ismoderator = session.ismoderator;
//         next();
//     } catch (error) {
//         console.error('Session middleware error:', error);
//         return handleSessionFail(req, res);
//     }
// }

// function handleSessionFail(req, res) {
//     return res.status(401).json({message: 'Session expired'});
//     // Check if the request is an API call
//     // if (req.originalUrl.startsWith('/profile') || req.originalUrl.startsWith('/api')) {
//     //     return res.status(401).json({ message: 'Session expired' });
//     // } else {
//     //     return res.redirect('/login');
//     // }
// }

async function getUserById(userId) {
    const result = await pool.query(
        `SELECT id,
                username,
                isverified,
                ismoderator
         FROM users
         WHERE id = $1`,
        [userId]
    );
    return result.rows[0];
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    verifySession
};
