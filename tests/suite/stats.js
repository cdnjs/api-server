const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');
const fetch = require('../fetch');
const testCors = require('../cors');
const testHuman = require('../human');

describe('/stats', () => {
    describe('No query params', () => {
        const path = '/stats';
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
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            done();
        });
        it('returns a JSON body that is a stats object', done => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            done();
        });
        describe('cdnjs stats object', () => {
            it('is an object with the \'libraries\' property', done => {
                expect(response.body).to.have.property('libraries').that.is.an('number');
                done();
            });
            it('has no other properties', done => {
                expect(Object.keys(response.body)).to.have.lengthOf(1);
                done();
            });
        });
    });

    describe('Requesting human response (?output=human)', () => {
        const path = '/stats?output=human';
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
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            done();
        });
        testHuman(() => response);
    });
});
