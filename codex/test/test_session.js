// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const db = require('../db/db');
const sessionMod = require('../models/session');
const crypto = require('crypto');
const auth = require('../models/auth');

// Tests for session DB functions
describe('Session DB functions', () => {
    let originalRandomBytes, originalQuery;

    before(() => {
        // Saving originals to restore after
        originalRandomBytes = crypto.randomBytes;
        originalQuery = db.pool.query;
    });

    after(() => {
        // Restore back to original
        crypto.randomBytes = originalRandomBytes;
        db.pool.query = originalQuery;
    });

    // createSession() function test
    describe('createSession()', () => {
        it('Returns a predictable token and future expiresAt', async () => {
            // Stub randomBytes for predictable token 
            // Random 16 byte hex used
            crypto.randomBytes = () => Buffer.from('00112233445566778899aabbccddeeff', 'hex');

            let lastParams;
            // Stub pool.query to capture the params
            db.pool.query = (sql, params) => { lastParams = params; return Promise.resolve(); };

            // Record the time before calling createSession function
            const before = Date.now();
            const { token, expiresAt } = await sessionMod.createSession(5);

            // Token should match stubbed bytes
            // Random 16 byte hex used
            expect(token).to.equal('00112233445566778899aabbccddeeff');
            // DB insert params: [userId, token, now, expiresAt]
            expect(lastParams[0]).to.equal(5);
            expect(lastParams[1]).to.equal(token);
            expect(lastParams[2]).to.be.instanceOf(Date);
            expect(lastParams[3]).to.be.instanceOf(Date);
            // expiresAt timestamp is 1min in the future
            expect(expiresAt.getTime()).to.be.within(before + 50000, before + 70000);
        });
    });

    // getSession() function test 
    describe('getSession()', () => {
        it('Returns the first row from the sesh table', async () => {
            // Prepare a fake session row to be returned by the stub
            const row = { foo: 1 };
            db.pool.query = () => Promise.resolve({ rows: [row] });
            expect(await sessionMod.getSession('x')).to.equal(row);
        });
    });

    // getUserById() function test
    describe('getUserById()', () => {
        it('Returns the first row from the users table', async () => {
            // Simulate the DB returning one user record
            const row = { id: 3, username: 'user' };
            db.pool.query = () => Promise.resolve({ rows: [row] });
            expect(await auth.getUserById(3)).to.equal(row);
        });
    });
});