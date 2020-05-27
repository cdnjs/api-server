const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');

describe('/', () => {
    const test = () => request().get('/').redirects(0);
    let response;
    before('fetch endpoint', done => {
        test().end((err, res) => {
            response = res;
            done();
        });
    });
    it('returns the correct CORS and Cache headers', done => {
        expect(response).to.have.header('Access-Control-Allow-Origin', '*');
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
        done();
    });
    it('returns the correct CORS headers for OPTIONS', done => {
        request().options('/').redirects(0).end((err, res) => {
            expect(res).to.have.header('Access-Control-Allow-Origin', '*');
            done();
        });
    });
    it('redirects to the cdnjs.com API docs as a 301', done => {
        expect(response).to.have.status(301);
        expect(response).to.redirectTo('https://cdnjs.com/api');
        done();
    });
});

describe('/this-route-doesnt-exist', () => {
    const test = () => request().get('/this-route-doesnt-exist');
    let response;
    before('fetch endpoint', done => {
        test().end((err, res) => {
            response = res;
            done();
        });
    });
    it('returns the correct CORS and Cache headers', done => {
        expect(response).to.have.header('Access-Control-Allow-Origin', '*');
        expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
        done();
    });
    it('returns a JSON body that is a valid error response', done => {
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error', true);
        expect(response.body).to.have.property('status', 404);
        expect(response.body).to.have.property('message', 'Endpoint not found');
        done();
    });
});
