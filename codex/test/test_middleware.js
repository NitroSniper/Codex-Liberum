//chai using expect() style - https://mochajs.org (Mocha Documentation)
const { expect } = require('chai');
const sessionMod = require('../models/auth');

//Tests for session middleware and session failure
describe('sessionMiddleware & handleSessionFail', () => {
    let req, res, nextCalled, next;

    beforeEach(() => {
        //Mock request and response objects
        req = { cookies: {}, originalUrl: '/foo' };
        res = {
            statusCode: null,
            body: null,
            redirectPath: null,
            status(code) { this.statusCode = code; return this; },
            json(obj) { this.body = obj; },
            redirect(path) { this.redirectPath = path; }
        };
        nextCalled = false;
        next = () => { nextCalled = true; };

        //Default getSession returns null (no valid session)
        sessionMod.getSession = async () => null;
    });

    //Redirects to the login page when there is no token
    it('Redirects to /login when no token on a normal page', async () => {
        req.originalUrl = '/home';
        await sessionMod.sessionMiddleware(req, res, next);
        expect(res.redirectPath).to.equal('/login');
        expect(nextCalled).to.be.false;
    });

    //Redirects to the login page when there is no token
    it('Returns 401 JSON for API routes with no token', async () => {
        req.originalUrl = '/api/data';
        await sessionMod.sessionMiddleware(req, res, next);
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal({ message: 'Session expired' });
    });
});