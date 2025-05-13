// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const csrf = require('../models/csrf'); 
const db = require('../db/db');

// Test for CSRF functions
describe('CSRF tests', () => {

  // Test for generateTokenHash() function
  describe('generateTokenHash()', () => {
    it('returns a base64 string of 128 bytes', () => {
      const token = csrf.generateTokenHash(); // Generate the token
      const decoded = Buffer.from(token, 'base64'); // Decode it to check length
      expect(decoded.length).to.equal(128); // Should be exctly 128 bytes
      expect(token).to.be.a('string'); // Should be a string
    });
  });

  // Test: csrfTokenMiddleware behavior
  describe('csrfTokenMiddleware()', () => {
    let req, res, next;
    let originalQuery;

    beforeEach(() => {
      // Mock request object with default method/path/session/token
      req = {
        method: 'POST',
        path: '/secure/action',
        headers: {},
        session: { csrfToken: 'abc123', token: 'session-token' },
        body: {}
      };

      // Mock response object with status and send methods
      res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        send: function (msg) {
          this.message = msg;
        }
      };

      // Track if next() was called 
      next = () => { res.nextCalled = true };

      // Fake db.query so no real DB calls happens
      originalQuery = db.query;
      db.query = async () => { };
    });

    // Restore db.query after each test
    afterEach(() => {
      db.query = originalQuery;
    });

    // Request method is GET (ignored) - should skip protection
    it('skips protection for ignored methods', async () => {
      req.method = 'GET';
      csrf.csrfTokenMiddleware(req, res, next);
      expect(res.nextCalled).to.be.true;
    });

    // Request path is /auth/login (ignored) - should skip protection
    it('skips protection for ignored paths', async () => {
      req.path = '/auth/login';
      csrf.csrfTokenMiddleware(req, res, next);
      expect(res.nextCalled).to.be.true;
    });

    // Valid CSRF token is in body (_csrf) - should allow request
    it('allows request with valid CSRF token in body', async () => {
      req.body._csrf = 'abc123';
      csrf.csrfTokenMiddleware(req, res, next);
      expect(res.nextCalled).to.be.true;
    });

    // Valid CSRF token is in header - should allow request
    it('allows request with valid CSRF token in header', async () => {
      req.body = {};
      req.headers['x-csrf-token'] = 'abc123';
      csrf.csrfTokenMiddleware(req, res, next);
      expect(res.nextCalled).to.be.true;
    });

    // Invalid CSRF token - should reject with 403
    it('rejects request with invalid token', async () => {
      req.headers['x-csrf-token'] = 'wrong-token';
      csrf.csrfTokenMiddleware(req, res, next);
      expect(res.statusCode).to.equal(403);
      expect(res.message).to.include('Forbidden');
    });
  });
});

