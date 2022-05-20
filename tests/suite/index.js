const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');
const fetch = require('../fetch');
const testCors = require('../cors');
const testHuman = require('../human');

describe('/', () => {
    const path = '/';
    const test = () => request().get(path).redirects(0);
    let response;
    before('fetch endpoint', done => {
        fetch(test).then(res => {
            response = res;
            done();
        });
    });
    testCors(path, () => response);
    it('returns the correct Cache headers', done => {
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
        done();
    });
    it('redirects to the cdnjs.com API docs as a 301', done => {
        expect(response).to.have.status(301);
        expect(response).to.redirectTo('https://cdnjs.com/api');
        done();
    });
});

describe('/health', () => {
    const path = '/health';
    const test = () => request().get(path).redirects(0);
    let response;
    before('fetch endpoint', done => {
        fetch(test).then(res => {
            response = res;
            done();
        });
    });
    testCors(path, () => response);
    it('returns the correct Cache headers', done => {
        expect(response).to.have.header('Expires', '0');
        expect(response).to.have.header('Pragma', 'no-cache');
        expect(response).to.have.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        done();
    });
    it('returns on OK message with a 200 status code', done => {
        expect(response).to.have.status(200);
        expect(response).to.be.text;
        expect(response.text).to.eq('OK');
        done();
    });
});

describe('/robots.txt', () => {
    const path = '/robots.txt';
    const test = () => request().get(path);
    let response;
    before('fetch endpoint', done => {
        fetch(test).then(res => {
            response = res;
            done();
        });
    });
    testCors(path, () => response);
    it('returns the correct Cache headers', done => {
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
        done();
    });
    it('disallows all indexing', done => {
        expect(response).to.be.text;
        expect(response.text).to.eq('User-agent: *\nDisallow: /');
        done();
    });
});

describe('/this-route-doesnt-exist', () => {
    describe('No query params', () => {
        const path = '/this-route-doesnt-exist';
        const test = () => request().get(path);
        let response;
        before('fetch endpoint', done => {
            fetch(test).then(res => {
                response = res;
                done();
            });
        });
        testCors(path, () => response);
        it('returns the correct Cache headers', done => {
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

    describe('Requesting human response (?output=human)', () => {
        const path = '/this-route-doesnt-exist?output=human';
        const test = () => request().get(path);
        let response;
        before('fetch endpoint', done => {
            fetch(test, 5000).then(res => {
                response = res;
                done();
            });
        });
        testCors(path, () => response);
        it('returns the correct Cache headers', done => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            done();
        });
        testHuman(() => response);
    });
});
