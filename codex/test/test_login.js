// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const db = require('../db/db');
const auth = require('../models/auth');

// Tests for loginUser function
describe('loginUser()', function () {
    let originalQuery;

    before(function () {
        // Saving originals to restore after
        originalQuery = db.pool.query;
    });

    after(function () {
        // Restore after tests back to the original
        db.pool.query = originalQuery;
    });

    it('should reject when user does not exist', async function () {
        // Simulate no matching user in DB
        db.pool.query = () => Promise.resolve({ rows: [] });

        const result = await auth.loginUser('nonexistent', 'anyPassword');
        expect(result).to.be.an('object');
        expect(result).to.have.property('success', false);
        expect(result).to.have.property('message').that.matches(/invalid username or password/i);
        expect(result).to.not.have.property('userId');
        expect(result).to.not.have.property('ismoderator');
    });

    it('should reject when password is incorrect', async function () {
        // Fake user record with known salt, hash, and moderator flag
        const salt = 'testSalt';
        const correctHash = auth.hashPassword('correctPassword', salt);
        const fakeUser = { id: 1, salt, hashed_password: correctHash, ismoderator: false };

        db.pool.query = () => Promise.resolve({ rows: [fakeUser] });

        const result = await auth.loginUser('testUser', 'wrongPassword');
        expect(result).to.be.an('object');
        expect(result).to.have.property('success', false);
        expect(result).to.have.property('message').that.matches(/invalid username or password/i);
        expect(result).to.not.have.property('userId');
        expect(result).to.not.have.property('ismoderator');
    });

    it('should succeed with correct credentials and return userId and role', async function () {
        // Fake user record matching the login attempt
        const salt = 'anotherSalt';
        const correctHash = auth.hashPassword('rightPassword', salt);
        const fakeUser = { id: 2, salt, hashed_password: correctHash, ismoderator: true };

        db.pool.query = () => Promise.resolve({ rows: [fakeUser] });

        const result = await auth.loginUser('anotherUser', 'rightPassword');
        expect(result).to.be.an('object');
        expect(result).to.have.property('success', true);
        expect(result).to.have.property('message', 'Login successful!');
        expect(result).to.have.property('userId', 2);
        expect(result).to.have.property('ismoderator', true);
    });
});
