// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');

// Setting the environment variable before loading the module
process.env.ARGON_PEPPER = 'test_pepper';

// Loading the dependencies for testing - sessions
const sessionStore = require('../models/session');

// Test for verifySession() function
describe('verifySession() tests', () => {
  let originalGetSession, originalUpdateSession;

  // Backs up the original implementation before running tests
  before(() => {
    originalGetSession = sessionStore.getSession;
    originalUpdateSession = sessionStore.updateSessionToNow;
  });

  // Restoring the original implementation after the tests have finished
  after(() => {
    sessionStore.getSession = originalGetSession;
    sessionStore.updateSessionToNow = originalUpdateSession;
  });

  // Test 1: Should skip session setup when no cookies exist
  it('skips when no cookies are present', async () => {
    const req = { cookies: undefined }; // Simulate request with no cookies
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Stub session functions (should not be called in this case)
    sessionStore.getSession = async () => { throw new Error('should not be called'); };
    sessionStore.updateSessionToNow = async () => { };

    // Clear auth module from cache to reload with new stubs
    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    // Call verifySession
    await auth.verifySession(req, res, next);
    // Expect next() was called and session remains empty
    expect(nextCalled).to.be.true;
    expect(req.session).to.deep.equal({});
  });

  // Test 2: Should skip session setup when token is invalid - not found in DB
  it('skips when session token is invalid', async () => {
    const req = { cookies: { session_token: 'bad-token' } }; // Simulate bad token
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Simulate getSession returning null for invalid token
    sessionStore.getSession = async () => null;
    sessionStore.updateSessionToNow = async () => { };

    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    await auth.verifySession(req, res, next);
    expect(nextCalled).to.be.true;
    expect(req.session).to.deep.equal({});
  });

  // Test 3: Should populate req.session correctly with a valid session token
  it('populates req.session with valid token', async () => {
    // Simulated session data returned from DB
    const sessionData = {
      user_id: 1,
      ismoderator: true,
      isverified: false,
      csrf_token: 'abc123'
    };

    // Simulated request with a valid session token
    const req = { cookies: { session_token: 'good-token' } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Stub getSession to return mock session data
    sessionStore.getSession = async (token) => {
      expect(token).to.equal('good-token'); // Validate token passed in
      return sessionData;
    };

    // Track whether updateSessionToNow is called with correct token
    let updateCalled = false;
    sessionStore.updateSessionToNow = async (token) => {
      updateCalled = token === 'good-token';
    };

    delete require.cache[require.resolve('../models/auth')];
    const auth = require('../models/auth');

    // Call verifySession with valid token
    await auth.verifySession(req, res, next);
    // Expect next() was called
    expect(nextCalled).to.be.true;
    // Expect updateSessionToNow was triggered with valid token
    expect(updateCalled).to.be.true;
    // Expect session object is populated correctly
    expect(req.session).to.include({
      token: 'good-token',
      userID: 1,
      isModerator: true,
      isVerified: false,
      csrfToken: 'abc123'
    });
  });

  // Test 4: Should still call next and not crash even if getSession throws an error
  it('still calls next and does not throw if getSession throws', async () => {
    const req = { cookies: { session_token: 'error-token' } }; // Simulated token that will cause error
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Simulate getSession throwing a DB error
    sessionStore.getSession = async () => {
      throw new Error('Simulated session DB error');
    };

    sessionStore.updateSessionToNow = async () => { };

    delete require.cache[require.resolve('../models/auth')];

    // Call verifySession (should catch error internally and still call next)
    const auth = require('../models/auth');

    await auth.verifySession(req, res, next);
    expect(nextCalled).to.be.true;
    expect(req.session).to.deep.equal({});
  });
});
