import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import request from '../utils/spec/request.js';
import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';

describe('/libraries/:library/tutorials', () => {
    describe('Requesting for a valid library (:library = backbone.js)', () => {
        describe('No query params', () => {
            // Define endpoint info
            const path = '/libraries/backbone.js/tutorials';
            const fetch = () => request(path);

            // Fetch the endpoint
            let response;
            before('fetch endpoint', () => fetch().then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=86400'); // 24 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body that is an empty array', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('array');
                expect(response.body).to.be.empty;
            });
        });

        describe('Requesting human response (?output=human)', () => {
            // Define endpoint info
            const path = '/libraries/backbone.js/tutorials?output=human';
            const fetch = () => request(path);

            // Fetch the endpoint
            let response;
            before('fetch endpoint', () => fetch().then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=86400'); // 24 hours
            });
            testHuman(() => response);
        });
    });

    describe('Requesting for a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('No query params', () => {
            // Define endpoint info
            const path = '/libraries/this-library-doesnt-exist/tutorials';
            const fetch = () => request(path);

            // Fetch the endpoint
            let response;
            before('fetch endpoint', () => fetch().then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(404);
            });
            it('returns a JSON body that is a valid error response', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('error', true);
                expect(response.body).to.have.property('status', 404);
                expect(response.body).to.have.property('message', 'Library not found');
            });
        });

        describe('Requesting human response (?output=human)', () => {
            // Define endpoint info
            const path = '/libraries/this-library-doesnt-exist/tutorials?output=human';
            const fetch = () => request(path);

            // Fetch the endpoint
            let response;
            before('fetch endpoint', () => fetch().then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            });
            testHuman(() => response);
        });
    });
});

describe('/libraries/:library/tutorials/:tutorial', () => {
    describe('Requesting for a valid library (:library = backbone.js)', () => {
        describe('Requesting a valid tutorial (:tutorial = what-is-a-view)', () => {
            describe('No query params', () => {
                // Define endpoint info
                const path = '/libraries/backbone.js/tutorials/what-is-a-view';
                const fetch = () => request(path);

                // Fetch the endpoint
                let response;
                before('fetch endpoint', () => fetch().then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(404);
                });
                it('returns a JSON body that is a valid error response', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.property('error', true);
                    expect(response.body).to.have.property('status', 404);
                    expect(response.body).to.have.property('message', 'Tutorial not found');
                });
            });

            describe('Requesting human response (?output=human)', () => {
                // Define endpoint info
                const path = '/libraries/backbone.js/tutorials/what-is-a-view?output=human';
                const fetch = () => request(path);

                // Fetch the endpoint
                let response;
                before('fetch endpoint', () => fetch().then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                testHuman(() => response);
            });
        });

        describe('Requesting a non-existent tutorial (:tutorial = this-tutorial-doesnt-exist)', () => {
            describe('No query params', () => {
                // Define endpoint info
                const path = '/libraries/backbone.js/tutorials/this-tutorial-doesnt-exist';
                const fetch = () => request(path);

                // Fetch the endpoint
                let response;
                before('fetch endpoint', () => fetch().then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(404);
                });
                it('returns a JSON body that is a valid error response', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.property('error', true);
                    expect(response.body).to.have.property('status', 404);
                    expect(response.body).to.have.property('message', 'Tutorial not found');
                });
            });

            describe('Requesting human response (?output=human)', () => {
                // Define endpoint info
                const path = '/libraries/backbone.js/tutorials/this-tutorial-doesnt-exist?output=human';
                const fetch = () => request(path);

                // Fetch the endpoint
                let response;
                before('fetch endpoint', () => fetch().then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                testHuman(() => response);
            });
        });
    });

    describe('Requesting for a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('Requesting a non-existent tutorial (:tutorial = this-tutorial-doesnt-exist)', () => {
            describe('No query params', () => {
                // Define endpoint info
                const path = '/libraries/this-library-doesnt-exist/tutorials/this-tutorial-doesnt-exist';
                const fetch = () => request(path);

                // Fetch the endpoint
                let response;
                before('fetch endpoint', () => fetch().then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(404);
                });
                it('returns a JSON body that is a valid error response', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.property('error', true);
                    expect(response.body).to.have.property('status', 404);
                    expect(response.body).to.have.property('message', 'Library not found');
                });
            });

            describe('Requesting human response (?output=human)', () => {
                // Define endpoint info
                const path = '/libraries/this-library-doesnt-exist/tutorials/this-tutorial-doesnt-exist?output=human';
                const fetch = () => request(path);

                // Fetch the endpoint
                let response;
                before('fetch endpoint', () => fetch().then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                testHuman(() => response);
            });
        });
    });
});
