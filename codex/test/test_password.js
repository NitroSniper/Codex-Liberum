// chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const auth = require('../models/auth');

// Tests password functions: generateSalt, hashPassword and verifyPassword
describe('Auth pure helpers', () => {
  it('generateSalt() returns a 32-char hex string', () => {
    // generateSalt should produce a hex string of length 32 (16 bytes * 2 chars per byte)
    const salt = auth.generateSalt();
    expect(salt).to.be.a('string').with.length(32);
    // Checks if it only contains hex characters
    expect(/^[0-9a-f]+$/.test(salt)).to.be.true;
  });

  it('hashPassword() is deterministic and produces a 64-char hex string', () => {
    // Testing that with a fixed salt, hashing the same password twice should produce the same output
    const salt = 'aaaaaaaaaaaaaaaa';
    const h1 = auth.hashPassword('mypassword', salt);
    const h2 = auth.hashPassword('mypassword', salt);
    expect(h1).to.equal(h2);
    // SHA256 hex digest length is 64
    expect(h1).to.be.a('string').with.length(64);
  });

  it('verifyPassword() correctly matches and rejects passwords', async () => {
    // Create a known hash and test matching and non-matching passwords
    const salt = 'aaaaaaaaaaaaaaaa';
    const goodHash = auth.hashPassword('secretpassword', salt);
    expect(await auth.verifyPassword(goodHash, 'secretpassword', salt)).to.be.true;
    expect(await auth.verifyPassword(goodHash, 'wrongpassword', salt)).to.be.false;
  });
});