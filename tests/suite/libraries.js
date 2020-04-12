const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');

describe('/libraries', () => {
    describe('No query params', () => {
        const test = () => request().get('/libraries');
        let response;
        before('fetch endpoint', done => {
            test().end((err, res) => {
                response = res;
                done();
            });
        });
        it('returns the correct CORS and Cache headers', done => {
            expect(response).to.have.header('Access-Control-Allow-Origin', '*');
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            done();
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', done => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
            done();
        });
        it('returns all available hits', done => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
            done();
        });
        describe('Library object', () => {
            it('is an object with \'name\' and \'latest\' properties', done => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    expect(result).to.have.property('latest').that.is.a('string');
                }
                done();
            });
            it('has a CDN url for the \'latest\' property', done => {
                for (const result of response.body.results) {
                    expect(result.latest).to.match(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/.+\/.+\/.*/);
                }
                done();
            });
            it('has no other properties', done => {
                for (const result of response.body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(2);
                }
                done();
            });
        });
    });

    describe('Limiting number of results (?limit=10)', () => {
        const test = () => request().get('/libraries?limit=10');
        let response;
        before('fetch endpoint', done => {
            test().end((err, res) => {
                response = res;
                done();
            });
        });
        it('returns the correct CORS and Cache headers', done => {
            expect(response).to.have.header('Access-Control-Allow-Origin', '*');
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            done();
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', done => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
            done();
        });
        it('returns only the requested number of hits', done => {
            expect(response.body.results).to.have.lengthOf(10);
            expect(response.body.total).to.equal(10);
            expect(response.body.available).to.be.above(10);
            done();
        });
    });

    describe('Requesting a field (?fields=version)', () => {
        const test = () => request().get('/libraries?fields=version');
        let response;
        before('fetch endpoint', done => {
            test().end((err, res) => {
                response = res;
                done();
            });
        });
        it('returns the correct CORS and Cache headers', done => {
            expect(response).to.have.header('Access-Control-Allow-Origin', '*');
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            done();
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', done => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
            done();
        });
        it('returns all available hits', done => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
            done();
        });
        describe('Library object', () => {
            it('is an object with \'name\', \'latest\' and requested \'version\' properties', done => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    expect(result).to.have.property('latest').that.is.a('string');
                    expect(result).to.have.property('version').that.is.a('string');
                }
                done();
            });
            it('has no other properties', done => {
                for (const result of response.body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(3);
                }
                done();
            });
        });
    });

    describe('Requesting all fields (?fields=*)', () => {
        const test = () => request().get('/libraries?fields=*');
        let response;
        before('fetch endpoint', done => {
            test().end((err, res) => {
                response = res;
                done();
            });
        });
        it('returns the correct CORS and Cache headers', done => {
            expect(response).to.have.header('Access-Control-Allow-Origin', '*');
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            done();
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', done => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
            done();
        });
        it('returns all available hits', done => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
            done();
        });
        describe('Library object', () => {
            it('is an object with the full set of library properties', done => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    expect(result).to.have.property('latest').that.is.a('string');
                    expect(result).to.have.property('filename').that.is.a('string');
                    expect(result).to.have.property('description').that.is.a('string');
                    expect(result).to.have.property('version').that.is.a('string');
                    try {
                        expect(result).to.have.property('keywords').that.is.an('array');
                    } catch (_) {
                        expect(result).to.have.property('keywords').that.is.null;
                    }
                    expect(result).to.have.property('alternativeNames').that.is.an('array');
                    expect(result).to.have.property('fileType').that.is.a('string');
                    try {
                        expect(result).to.have.property('github').that.is.an('object');
                    } catch (_) {
                        expect(result).to.have.property('github').that.is.null;
                    }
                    expect(result).to.have.property('license').that.is.a('string');
                    expect(result).to.have.property('homepage').that.is.a('string');
                    expect(result).to.have.property('repository').that.is.an('object');
                    expect(result).to.have.property('author').that.is.a('string');
                    expect(result).to.have.property('originalName').that.is.a('string');
                    expect(result).to.have.property('sri').that.is.a('string');
                    expect(result).to.have.property('objectID').that.is.a('string');
                }
                done();
            });
        });
    });

    describe('Searching for libraries (?search=hi-sven)', () => {
        // This set of tests is incredibly fragile
        // Testing of the searching functionality should be done by hand
        // TODO: Make this set of tests more robust
        const test = () => request().get('/libraries?search=hi-sven');
        let response;
        before('fetch endpoint', done => {
            test().end((err, res) => {
                response = res;
                done();
            });
        });
        it('returns the correct CORS and Cache headers', done => {
            expect(response).to.have.header('Access-Control-Allow-Origin', '*');
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            done();
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', done => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
            done();
        });
        it('returns all available hits', done => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
            done();
        });
        describe('Library object', () => {
            it('returns the \'hi-sven\' package as the first object', done => {
                expect(response.body.results[0]).to.have.property('name', 'hi-sven');
                done();
            });
            it('is an object with \'name\' and \'latest\' properties', done => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    expect(result).to.have.property('latest').that.is.a('string');
                }
                done();
            });
            it('has no other properties', done => {
                for (const result of response.body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(2);
                }
                done();
            });
        });
    });
});
