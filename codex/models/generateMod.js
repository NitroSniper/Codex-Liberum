const crypto = require('crypto');

// Secret pepper
const pepper = 'my_secret_pepper'; 

// Function to generate a random salt
function generateSalt() {
    return crypto.randomBytes(16).toString('hex'); // 16-byte salt
}

// Function to generate hashed password
function hashPassword(password, salt) {
    const passwordWithSaltAndPepper = salt + password + pepper;
    return crypto.createHash('sha256')
        .update(passwordWithSaltAndPepper)
        .digest('hex');
}

// Moderator username and password - can be manually inputted into users table
const username = 'moderator1';
const password = 'modpassword'; 

const salt = generateSalt();
const hashedPassword = hashPassword(password, salt);


console.log('Use the following values for manual SQL insert:');
console.log('Username:', username);
console.log('Salt:', salt);
console.log('Hashed Password:', hashedPassword);

console.log(`
INSERT INTO users (username, hashed_password, salt, isverified, ismoderator)
VALUES ('${username}', '${hashedPassword}', '${salt}', TRUE, TRUE);
`);
