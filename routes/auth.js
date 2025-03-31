const crypto = require('crypto');
const db = require('../db/database');

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
        const result = await db.query(query, [username, salt, hashedPassword]);

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
        const { rows } = await db.query(query, [username]);

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

module.exports = { registerUser, loginUser };
