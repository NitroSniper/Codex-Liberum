//chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const db = require('../db/db');
const auth = require('../models/auth');

//Tests for register functions
describe('registerUser()', () => {
    let originalQuery;

    before(() => {
        //Saves the original DB query function
        originalQuery = db.pool.query;
    });

    after(() => {
        //Restore after tests back to the original
        db.pool.query = originalQuery;
    });

    it('Resolves with new userId on success', async () => {
        //Stub pool.query to simulate successful INSERT returning id = 42
        db.pool.query = () => Promise.resolve({ rows: [{ id: 42 }] });
        const res = await auth.registerUser('joe', 'password');
        expect(res).to.deep.equal({
            success: true,
            message: 'User registered successfully!',
            userId: 42
        });
    });

    it('Returns success:false on DB error', async () => {
        //Stub pool.query to throw an error
        db.pool.query = () => Promise.reject(new Error('DB down'));
        const res = await auth.registerUser('joe', 'password');
        expect(res).to.deep.equal({
            success: false,
            message: 'Error registering user'
        });
    });
});
