const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('../base');
const fetch = require('../fetch');
const testCors = require('../cors');
const testHuman = require('../human');

describe('/libraries/:library/tutorials', () => {
    describe('Requesting for a valid library (:library = backbone.js)', () => {
        describe('No query params', () => {
            const path = '/libraries/backbone.js/tutorials';
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
                expect(response).to.have.header('Cache-Control', 'public, max-age=86400'); // 24 hours
                done();
            });
            it('returns a JSON body that is an empty array', done => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('array');
                expect(response.body).to.be.empty;
                done();
            });
        });

        describe('Requesting human response (?output=human)', () => {
            const path = '/libraries/backbone.js/tutorials?output=human';
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
                expect(response).to.have.header('Cache-Control', 'public, max-age=86400'); // 24 hours
                done();
            });
            testHuman(() => response);
        });
    });

    describe('Requesting for a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('No query params', () => {
            const path = '/libraries/this-library-doesnt-exist/tutorials';
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
                expect(response.body).to.have.property('message', 'Library not found');
                done();
            });
        });

        describe('Requesting human response (?output=human)', () => {
            const path = '/libraries/this-library-doesnt-exist/tutorials?output=human';
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
});

describe('/libraries/:library/tutorials/:tutorial', () => {
    describe('Requesting for a valid library (:library = backbone.js)', () => {
        describe('Requesting a valid tutorial (:tutorial = what-is-a-view)', () => {
            describe('No query params', () => {
                const path = '/libraries/backbone.js/tutorials/what-is-a-view';
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
                    expect(response.body).to.have.property('message', 'Tutorial not found');
                    done();
                });
            });

            describe('Requesting human response (?output=human)', () => {
                const path = '/libraries/backbone.js/tutorials/what-is-a-view?output=human';
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

        describe('Requesting a non-existent tutorial (:tutorial = this-tutorial-doesnt-exist)', () => {
            describe('No query params', () => {
                const path = '/libraries/backbone.js/tutorials/this-tutorial-doesnt-exist';
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
                    expect(response.body).to.have.property('message', 'Tutorial not found');
                    done();
                });
            });

            describe('Requesting human response (?output=human)', () => {
                const path = '/libraries/backbone.js/tutorials/this-tutorial-doesnt-exist?output=human';
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
    });

    describe('Requesting for a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('Requesting a non-existent tutorial (:tutorial = this-tutorial-doesnt-exist)', () => {
            describe('No query params', () => {
                const path = '/libraries/this-library-doesnt-exist/tutorials/this-tutorial-doesnt-exist';
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
                    expect(response.body).to.have.property('message', 'Library not found');
                    done();
                });
            });

            describe('Requesting human response (?output=human)', () => {
                const path = '/libraries/this-library-doesnt-exist/tutorials/this-tutorial-doesnt-exist?output=human';
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
    });
});
