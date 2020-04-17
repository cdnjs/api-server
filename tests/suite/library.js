const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');

describe('/libraries/:library/:version (:library = backbone.js)', () => {
    describe('Requesting a valid version (:version = 1.1.0)', () => {
        describe('No query params', () => {
            const test = () => request().get('/libraries/backbone.js/1.1.0');
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
            it('returns a JSON body that is a library version object', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                done();
            });
            describe('Library version object', () => {
                it('is an object with \'name\', \'version\', \'files\' and \'sri\' properties', done => {
                    expect(response.body).to.have.property('name', 'backbone.js');
                    expect(response.body).to.have.property('version', '1.1.0');
                    expect(response.body).to.have.property('files').that.is.an('array');
                    expect(response.body).to.have.property('sri').that.is.an('object');
                    done();
                });
                it('has no other properties', done => {
                    expect(Object.keys(response.body)).to.have.lengthOf(4);
                    done();
                });
            });
        });

        describe('Requesting a field (?fields=files)', () => {
            const test = () => request().get('/libraries/backbone.js/1.1.0?fields=files');
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
            it('returns a JSON body that is a library version object', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                done();
            });
            describe('Library version object', () => {
                it('is an object with only the \'files\' property', done => {
                    expect(response.body).to.have.property('files').that.is.an('array');
                    done();
                });
                it('has no other properties', done => {
                    expect(Object.keys(response.body)).to.have.lengthOf(1);
                    done();
                });
            });
        });

        describe('Requesting all fields (?fields=*)', () => {
            const test = () => request().get('/libraries/backbone.js/1.1.0?fields=*');
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
            it('returns a JSON body that is a library version object', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                done();
            });
            describe('Library version object', () => {
                it('is an object with \'name\', \'version\', \'files\' and \'sri\' properties', done => {
                    expect(response.body).to.have.property('name', 'backbone.js');
                    expect(response.body).to.have.property('version', '1.1.0');
                    expect(response.body).to.have.property('files').that.is.an('array');
                    expect(response.body).to.have.property('sri').that.is.an('object');
                    done();
                });
                it('has no other properties', done => {
                    expect(Object.keys(response.body)).to.have.lengthOf(4);
                    done();
                });
            });
        });
    });

    describe('Requesting a non-existent version (:version = this-version-doesnt-exist)', () => {
        describe('No query params', () => {
            const test = () => request().get('/libraries/backbone.js/this-version-doesnt-exist');
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
                expect(response.body).to.have.property('message', 'Version not found');
                done();
            });
        });
    });
});

// TODO: /libraries/:library
