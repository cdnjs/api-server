const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');
const testCors = require('../cors');

// This endpoint is a prod-only endpoint for monitoring the API auto-update job by maintainers
describe('/update', () => {
    const path = '/update';
    const test = () => request().get(path);
    let response;
    before('fetch endpoint', done => {
        test().end((err, res) => {
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
