import { expect } from 'chai';
import { describe, it, before } from 'mocha';

import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';
import request from '../utils/spec/request.js';

describe('/whitelist', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/whitelist';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours;
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with \'extensions\' and \'categories\' properties', () => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('extensions').that.is.an('array');
            expect(response.body).to.have.property('categories').that.is.an('object');
        });
        it('has no other properties', () => {
            expect(Object.keys(response.body)).to.have.lengthOf(2);
        });
        describe('Extensions array', () => {
            it('only has string elements', () => {
                for (const result of response.body.extensions) {
                    expect(result).to.be.a('string');
                }
            });
        });
        describe('Categories object', () => {
            it('has a key for each value in \'extensions\'', () => {
                const keys = Object.keys(response.body.categories);
                for (const result of response.body.extensions) {
                    expect(keys).to.include(result);
                }
            });
            it('has a string value for each key', () => {
                for (const result of Object.values(response.body.categories)) {
                    expect(result).to.be.a('string');
                }
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(response.body);
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/whitelist?output=human';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
        });
        testHuman(() => response);
    });

    describe('Requesting a field (?fields=extensions)', () => {
        // Fetch the endpoint
        const path = '/whitelist?fields=extensions';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with the \'extensions\' property', () => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('extensions').that.is.an('array');
        });
        it('has no other properties', () => {
            expect(Object.keys(response.body)).to.have.lengthOf(1);
        });
    });

    describe('Requesting multiple fields', () => {
        describe('through comma-separated string (?fields=extensions,categories)', () => {
            // Fetch the endpoint
            const path = '/whitelist?fields=extensions,categories';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with the \'extensions\' and \'categories\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('extensions').that.is.an('array');
                expect(response.body).to.have.property('categories').that.is.an('object');
            });
            it('has no other properties', () => {
                expect(Object.keys(response.body)).to.have.lengthOf(2);
            });
        });

        describe('through space-separated string (?fields=extensions categories)', () => {
            // Fetch the endpoint
            const path = '/whitelist?fields=extensions categories';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with the \'extensions\' and \'categories\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('extensions').that.is.an('array');
                expect(response.body).to.have.property('categories').that.is.an('object');
            });
            it('has no other properties', () => {
                expect(Object.keys(response.body)).to.have.lengthOf(2);
            });
        });

        describe('through multiple query parameters (?fields=extensions&fields=categories)', () => {
            // Fetch the endpoint
            const path = '/whitelist?fields=extensions&fields=categories';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with the \'extensions\' and \'categories\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('extensions').that.is.an('array');
                expect(response.body).to.have.property('categories').that.is.an('object');
            });
            it('has no other properties', () => {
                expect(Object.keys(response.body)).to.have.lengthOf(2);
            });
        });
    });

    describe('Requesting all fields (?fields=*)', () => {
        // Fetch the endpoint
        const path = '/whitelist?fields=*';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with \'extensions\' and \'categories\' properties', () => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('extensions').that.is.an('array');
            expect(response.body).to.have.property('categories').that.is.an('object');
        });
        it('has no other properties', () => {
            expect(Object.keys(response.body)).to.have.lengthOf(2);
        });
    });
});
