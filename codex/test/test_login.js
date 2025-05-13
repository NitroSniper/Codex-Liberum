// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');

// Setting the environment variable before loading the module
process.env.ARGON_PEPPER = 'test_pepper';

// Loading the dependencies for testing - db & argon2
const db = require('../db/db');
const argon2 = require('argon2');

// Test for loginUser() function
describe('loginUser() tests', () => {
  let originalQuery, originalVerify;

  // Backs up the original implementation before running tests
  before(() => {
    originalQuery = db.query;
    originalVerify = argon2.verify;
  });

  // Restoring the original implementation after the tests have finished
  after(() => {
    db.query = originalQuery;
    argon2.verify = originalVerify;
  });

  // Test 1: Valid user with correct password
  it('returns user object when username and password are valid', async () => {
    const fakeUser = {
      id: 1,
      username: 'joe',
      hashed_password: 'HASHED',
      ismoderator: false,
      isverified: true,
      two_factor_enabled: false,
      two_factor_secret: null
    };

    // Fake db.query to simulate finding the user
    db.query = async () => ({ rows: [fakeUser] });

    // Fake argon2.verify to simulate correct password
    argon2.verify = async () => true;

    // To clear cache and re-import auth
    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    // Call loginUser and expect the correct user object
    const result = await auth.loginUser('joe', 'password');
    expect(result).to.deep.equal(fakeUser);
  });

  // Test 2: User not found
  it('returns null when no user is found', async () => {
    // Fake db.query to simulate no results
    db.query = async () => ({ rows: [] });
    argon2.verify = async () => true; // shouldn't be called

    // Re-import with fakes active
    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    const result = await auth.loginUser('nouser', 'password');
    expect(result).to.be.null;
  });

  // Test 3: Password is incorrect
  it('returns null when password is invalid', async () => {
    const fakeUser = {
      id: 1,
      username: 'joe',
      hashed_password: 'HASHED',
      ismoderator: false,
      isverified: true,
      two_factor_enabled: false,
      two_factor_secret: null
    };

    // Fake db.query to simulate user being found
    db.query = async () => ({ rows: [fakeUser] });

    // Fake argon2.verify to simulate wrong password
    argon2.verify = async () => false;

    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    const result = await auth.loginUser('joe', 'wrongpass');
    expect(result).to.be.null;
  });

  // Test 4: If database query fails (throws error)
  it('returns null on DB error', async () => {

    // Simulate fake throwing an error
    db.query = async () => { throw new Error('DB fail'); };
    argon2.verify = async () => true; // shouldn't be reached

    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    const result = await auth.loginUser('joe', 'password');
    expect(result).to.be.null;
  });
});
