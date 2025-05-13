// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');

// Setting the environment variable before loading the module
process.env.ARGON_PEPPER = 'test_pepper';

// Loading the dependencies for testing - db & argon2
const db = require('../db/db');
const argon2 = require('argon2');

// Test for registerUser() function
describe('registerUser() tests', () => {
  let originalQuery, originalHash;

  // Backs up the original implementation before running tests
  before(() => {
    originalQuery = db.query;
    originalHash = argon2.hash;
  });

  // Restoring the original implementation after the tests have finished
  after(() => {
    db.query = originalQuery;
    argon2.hash = originalHash;
  });

  // Test 1: should return true when the DB insert is successful
  it('returns true when DB insert succeeds', async () => {
    
    // Fake db.query to simulate successful insert (no error thrown)
    db.query = async () => {
      return {}; // Simulate success
    };

    // Fake argon2.hash to return a fake hashed password
    argon2.hash = async () => 'HASHED';

    // To clear cache and re-import auth
    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    // Call registerUser and expect the correct user object
    const result = await auth.registerUser('joe', 'password');
    expect(result).to.be.true;
  });


  // Test 2: should return false when db.query throws an error
  it('returns false when DB insert throws error', async () => {

    // Fake db.query to simulate DB error
    db.query = async () => {
      throw new Error('Simulated DB error');
    };

    // Fake argon2.hash to still return a fake hash
    argon2.hash = async () => 'HASHED';

    // Reload auth module after setting the fakes
    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    const result = await auth.registerUser('joe', 'password');
    expect(result).to.be.false;
  });
});
