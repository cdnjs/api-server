const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');
const testCors = require('../cors');

describe('/libraries/:library/:version', () => {
    describe('Requesting a valid library (:library = backbone.js)', () => {
        describe('Requesting a valid version (:version = 1.1.0)', () => {
            describe('No query params', () => {
                const path = '/libraries/backbone.js/1.1.0';
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
                    expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                    done();
                });
                it('returns a JSON body that is a library version object', done => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    done();
                });
                describe('Library version object', () => {
                    it('is an object with \'name\', \'version\', \'files\', \'rawFiles\' and \'sri\' properties', done => {
                        expect(response.body).to.have.property('name', 'backbone.js');
                        expect(response.body).to.have.property('version', '1.1.0');
                        expect(response.body).to.have.property('files').that.is.an('array');
                        expect(response.body).to.have.property('rawFiles').that.is.an('array');
                        expect(response.body).to.have.property('sri').that.is.an('object');
                        done();
                    });
                    it('has no other properties', done => {
                        expect(Object.keys(response.body)).to.have.lengthOf(5);
                        done();
                    });
                });
            });

            describe('Requesting a field (?fields=files)', () => {
                const path = '/libraries/backbone.js/1.1.0?fields=files';
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

            describe('Requesting multiple fields', () => {
                describe('through comma-separated string (?fields=files,sri)', () => {
                    const test = () => request().get('/libraries/backbone.js/1.1.0?fields=files,sri');
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
                    it('returns a JSON body that is a library object', done => {
                        expect(response).to.be.json;
                        expect(response.body).to.be.an('object');
                        done();
                    });
                    describe('Library version object', () => {
                        it('is an object with only the \'files\' and \'sri\' properties', done => {
                            expect(response.body).to.have.property('files').that.is.an('array');
                            expect(response.body).to.have.property('sri').that.is.an('object');
                            done();
                        });
                        it('has no other properties', done => {
                            expect(Object.keys(response.body)).to.have.lengthOf(2);
                            done();
                        });
                    });
                });

                describe('through multiple query parameters (?fields=files&fields=sri)', () => {
                    const test = () => request().get('/libraries/backbone.js/1.1.0?fields=files&fields=sri');
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
                    it('returns a JSON body that is a library object', done => {
                        expect(response).to.be.json;
                        expect(response.body).to.be.an('object');
                        done();
                    });
                    describe('Library version object', () => {
                        it('is an object with only the \'files\' and \'sri\' properties', done => {
                            expect(response.body).to.have.property('files').that.is.an('array');
                            expect(response.body).to.have.property('sri').that.is.an('object');
                            done();
                        });
                        it('has no other properties', done => {
                            expect(Object.keys(response.body)).to.have.lengthOf(2);
                            done();
                        });
                    });
                });
            });

            describe('Requesting all fields (?fields=*)', () => {
                const path = '/libraries/backbone.js/1.1.0?fields=*';
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
                    expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                    done();
                });
                it('returns a JSON body that is a library version object', done => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    done();
                });
                describe('Library version object', () => {
                    it('is an object with \'name\', \'version\', \'files\', \'rawFiles\' and \'sri\' properties', done => {
                        expect(response.body).to.have.property('name', 'backbone.js');
                        expect(response.body).to.have.property('version', '1.1.0');
                        expect(response.body).to.have.property('files').that.is.an('array');
                        expect(response.body).to.have.property('rawFiles').that.is.an('array');
                        expect(response.body).to.have.property('sri').that.is.an('object');
                        done();
                    });
                    it('has no other properties', done => {
                        expect(Object.keys(response.body)).to.have.lengthOf(5);
                        done();
                    });
                });
            });
        });

        describe('Requesting a non-existent version (:version = this-version-doesnt-exist)', () => {
            describe('No query params', () => {
                const path = '/libraries/backbone.js/this-version-doesnt-exist';
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

    describe('Requesting a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('No query params', () => {
            const path = '/libraries/this-library-doesnt-exist';
            const test = () => request().get(path);
            let response;
            before('fetch endpoint', done => {
                test().end((err, res) => {
                    response = res;
                    done();
                });
            });
            it('returns the correct Cache headers', done => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                done();
            });
            it('returns a JSON body that is a valid error response', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('error', true);
                expect(response.body).to.have.property('status', 404);
                expect(response.body).to.have.property('message', 'Library not found');
                done();
            });
        });
    });
});

describe('/libraries/:library', () => {
    describe('Requesting a valid library (:library = backbone.js)', () => {
        describe('No query params', () => {
            const path = '/libraries/backbone.js';
            const test = () => request().get(path);
            let response;
            before('fetch endpoint', done => {
                test().end((err, res) => {
                    response = res;
                    done();
                });
            });
            it('returns the correct Cache headers', done => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                done();
            });
            it('returns a JSON body that is a library object', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                done();
            });
            describe('Library object', () => {
                it('is an object with the full set of library properties', done => {
                    expect(response.body).to.have.property('name', 'backbone.js');
                    expect(response.body).to.have.property('latest').that.is.a('string');
                    expect(response.body).to.have.property('sri').that.is.a('string');
                    expect(response.body).to.have.property('filename').that.is.a('string');
                    expect(response.body).to.have.property('version').that.is.a('string');
                    expect(response.body).to.have.property('description').that.is.a('string');
                    expect(response.body).to.have.property('homepage').that.is.a('string');
                    expect(response.body).to.have.property('keywords').that.is.an('array');
                    expect(response.body).to.have.property('repository').that.is.an('object');
                    expect(response.body).to.have.property('license').that.is.a('string');
                    expect(response.body).to.have.property('author').that.is.a('string');
                    expect(response.body).to.have.property('autoupdate').that.is.an('object');
                    expect(response.body).to.have.property('assets').that.is.an('array');
                    expect(response.body).to.have.property('versions').that.is.an('array');
                    expect(response.body).to.have.property('tutorials').that.is.an('array');
                    done();
                });
                it('has a CDN url for the \'latest\' property', done => {
                    expect(response.body.latest).to.match(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/.+\/.+\/.*/);
                    done();
                });
                it('has a \'type\' and \'url\' property for \'repository\'', done => {
                    expect(response.body.repository).to.have.property('type').that.is.a('string');
                    expect(response.body.repository).to.have.property('url').that.is.a('string');
                    done();
                });
                it('has a \'type\'/\'source\' and \'target\' property for \'autoupdate\'', done => {
                    try {
                        expect(response.body.autoupdate).to.have.property('type').that.is.a('string');
                    } catch (_) {
                        expect(response.body.autoupdate).to.have.property('source').that.is.a('string');
                    }
                    expect(response.body.autoupdate).to.have.property('target').that.is.a('string');
                    done();
                });
                describe('Assets array', () => {
                    it('has \'version\', \'files\', \'rawFiles\' and \'sri\' properties for each entry', done => {
                        for (const result of response.body.assets) {
                            expect(result).to.have.property('version').that.is.a('string');
                            expect(result).to.have.property('files').that.is.an('array');
                            expect(result).to.have.property('rawFiles').that.is.an('array');
                            expect(result).to.have.property('sri').that.is.an('object');
                        }
                        done();
                    });
                });
                describe('Tutorials array', () => {
                    it('has \'id\', \'modified\', \'name\' and \'content\' properties for each entry', done => {
                        // and any properties from the tutorial metadata
                        for (const result of response.body.tutorials) {
                            expect(result).to.have.property('id').that.is.a('string');
                            expect(result).to.have.property('modified').that.is.a('string');
                            expect(result.modified).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('content').that.is.a('string');
                        }
                        done();
                    });
                });
            });
        });

        describe('Requesting a field (?fields=assets)', () => {
            const path = '/libraries/backbone.js?fields=assets';
            const test = () => request().get(path);
            let response;
            before('fetch endpoint', done => {
                test().end((err, res) => {
                    response = res;
                    done();
                });
            });
            it('returns the correct Cache headers', done => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                done();
            });
            it('returns a JSON body that is a library object', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                done();
            });
            describe('Library object', () => {
                it('is an object with only the \'assets\' property', done => {
                    expect(response.body).to.have.property('assets').that.is.an('array');
                    done();
                });
                it('has no other properties', done => {
                    expect(Object.keys(response.body)).to.have.lengthOf(1);
                    done();
                });
            });
        });

        describe('Requesting multiple fields', () => {
            describe('through comma-separated string (?fields=name,assets)', () => {
                const test = () => request().get('/libraries/backbone.js?fields=name,assets');
                let response;
                before('fetch endpoint', done => {
                    test().end((err, res) => {
                        response = res;
                        done();
                    });
                });
                it('returns the correct CORS and Cache headers', done => {
                    expect(response).to.have.header('Access-Control-Allow-Origin', '*');
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                    done();
                });
                it('returns a JSON body that is a library object', done => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    done();
                });
                describe('Library object', () => {
                    it('is an object with only the \'name\' and \'assets\' properties', done => {
                        expect(response.body).to.have.property('name').that.is.a('string');
                        expect(response.body).to.have.property('assets').that.is.an('array');
                        done();
                    });
                    it('has no other properties', done => {
                        expect(Object.keys(response.body)).to.have.lengthOf(2);
                        done();
                    });
                });
            });

            describe('through multiple query parameters (?fields=name&fields=assets)', () => {
                const test = () => request().get('/libraries/backbone.js?fields=name&fields=assets');
                let response;
                before('fetch endpoint', done => {
                    test().end((err, res) => {
                        response = res;
                        done();
                    });
                });
                it('returns the correct CORS and Cache headers', done => {
                    expect(response).to.have.header('Access-Control-Allow-Origin', '*');
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                    done();
                });
                it('returns a JSON body that is a library object', done => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    done();
                });
                describe('Library object', () => {
                    it('is an object with only the \'name\' and \'assets\' properties', done => {
                        expect(response.body).to.have.property('name').that.is.a('string');
                        expect(response.body).to.have.property('assets').that.is.an('array');
                        done();
                    });
                    it('has no other properties', done => {
                        expect(Object.keys(response.body)).to.have.lengthOf(2);
                        done();
                    });
                });
            });
        });

        describe('Requesting all fields (?fields=*)', () => {
            const path = '/libraries/backbone.js?fields=*';
            const test = () => request().get(path);
            let response;
            before('fetch endpoint', done => {
                test().end((err, res) => {
                    response = res;
                    done();
                });
            });
            it('returns the correct Cache headers', done => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                done();
            });
            it('returns a JSON body that is a library object', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                done();
            });
            describe('Library object', () => {
                // Behaves the same as not including the fields query param
                it('is an object with the full set of library properties', done => {
                    expect(response.body).to.have.property('name', 'backbone.js');
                    expect(response.body).to.have.property('latest').that.is.a('string');
                    expect(response.body).to.have.property('sri').that.is.a('string');
                    expect(response.body).to.have.property('filename').that.is.a('string');
                    expect(response.body).to.have.property('version').that.is.a('string');
                    expect(response.body).to.have.property('description').that.is.a('string');
                    expect(response.body).to.have.property('homepage').that.is.a('string');
                    expect(response.body).to.have.property('keywords').that.is.an('array');
                    expect(response.body).to.have.property('repository').that.is.an('object');
                    expect(response.body).to.have.property('license').that.is.a('string');
                    expect(response.body).to.have.property('author').that.is.a('string');
                    expect(response.body).to.have.property('autoupdate').that.is.an('object');
                    expect(response.body).to.have.property('assets').that.is.an('array');
                    expect(response.body).to.have.property('versions').that.is.an('array');
                    expect(response.body).to.have.property('tutorials').that.is.an('array');
                    done();
                });
            });
        });
    });

    describe('Requesting a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('No query params', () => {
            const path = '/libraries/this-library-doesnt-exist';
            const test = () => request().get(path);
            let response;
            before('fetch endpoint', done => {
                test().end((err, res) => {
                    response = res;
                    done();
                });
            });
            it('returns the correct Cache headers', done => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                done();
            });
            it('returns a JSON body that is a valid error response', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('error', true);
                expect(response.body).to.have.property('status', 404);
                expect(response.body).to.have.property('message', 'Library not found');
                done();
            });
        });
    });
});
