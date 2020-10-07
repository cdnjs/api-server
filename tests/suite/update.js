const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');
const fetch = require('../fetch');
const testCors = require('../cors');
const testHuman = require('../human');

// This endpoint is a prod-only endpoint for monitoring the API auto-update job by maintainers
describe('/update', () => {
    describe('No query params', () => {
        const path = '/update';
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
            expect(response).to.have.header('Cache-Control', 'public, max-age=300'); // 5 minutes
            done();
        });
        it('returns a JSON body', done => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            done();
        });
    });

    describe('Requesting human response (?output=human)', () => {
        const path = '/update?output=human';
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
            expect(response).to.have.header('Cache-Control', 'public, max-age=300'); // 5 minutes
            done();
        });
        testHuman(() => response);
    });
});
