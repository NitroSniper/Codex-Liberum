//chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const db = require('../db/db');
const auth = require('../models/auth');

//Tests for login
describe('loginUser()', () => {
    let originalQuery;

    before(() => {
        //Saves the original DB query function
        originalQuery = db.pool.query;
    });

    after(() => {
        //Restore after tests
        db.pool.query = originalQuery;
    });

    it('Rejects user with invalid credentials message', async () => {
        //To test user not found by creating a fake username and password that does not exist
        db.pool.query = () => Promise.resolve({ rows: [] });
        const res = await auth.loginUser('james', 'password');
        expect(res).to.deep.equal({
            success: false,
            message: 'Invalid username or password'
        });
    });

    it('Rejects wrong password', async () => {
        //Create a mock database user with a predefined password hash
        const salt = 'salt';
        const fakeUser = {
            id: 20,
            salt,
            hashed_password: auth.hashPassword('password', salt)
        };
        db.pool.query = () => Promise.resolve({ rows: [fakeUser] });
        const res = await auth.loginUser('rob', 'wrongPassword');
        expect(res).to.deep.equal({
            success: false,
            message: 'Invalid username or password'
        });
    });

    it('Accepts correct password and returns userId', async () => {
        //Create a mock database user with a hash of 'rightPassword'
        const salt = 'salt';
        const fakeUser = {
            id: 20,
            salt,
            hashed_password: auth.hashPassword('rightPassword', salt)
        };
        db.pool.query = () => Promise.resolve({ rows: [fakeUser] });
        const res = await auth.loginUser('bob', 'rightPassword');
        expect(res).to.deep.equal({
            success: true,
            message: 'Login successful!',
            userId: 20
        });
    });
});