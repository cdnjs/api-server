import { describe, it, expect } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import testHuman from '../utils/spec/human.ts';
import { beforeRequest, request } from '../utils/spec/request.ts';

describe('/whitelist', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/whitelist';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours;
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with \'extensions\' and \'categories\' properties', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.be.an('object');
            expect(body).to.have.property('extensions').that.is.an('array');
            expect(body).to.have.property('categories').that.is.an('object');
        });
        it('has no other properties', async () => {
            expect(Object.keys(await response.json())).to.have.lengthOf(2);
        });
        describe('Extensions array', () => {
            it('only has string elements', async () => {
                const body = await response.json();
                for (const result of body.extensions) {
                    expect(result).to.be.a('string');
                }
            });
        });
        describe('Categories object', () => {
            it('has a key for each value in \'extensions\'', async () => {
                const body = await response.json();
                const keys = Object.keys(body.categories);
                for (const result of body.extensions) {
                    expect(keys).to.include(result);
                }
            });
            it('has a string value for each key', async () => {
                const body = await response.json();
                for (const result of Object.values(body.categories)) {
                    expect(result).to.be.a('string');
                }
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(await res.json()).to.deep.equal(await response.json());
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/whitelist?output=human';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        testHuman(response);
    });

    describe('Requesting a field (?fields=extensions)', () => {
        // Fetch the endpoint
        const path = '/whitelist?fields=extensions';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with the \'extensions\' property', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.be.an('object');
            expect(body).to.have.property('extensions').that.is.an('array');
        });
        it('has no other properties', async () => {
            expect(Object.keys(await response.json())).to.have.lengthOf(1);
        });
    });

    describe('Requesting multiple fields', () => {
        describe('through comma-separated string (?fields=extensions,categories)', () => {
            // Fetch the endpoint
            const path = '/whitelist?fields=extensions,categories';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with the \'extensions\' and \'categories\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.be.an('object');
                expect(body).to.have.property('extensions').that.is.an('array');
                expect(body).to.have.property('categories').that.is.an('object');
            });
            it('has no other properties', async () => {
                expect(Object.keys(await response.json())).to.have.lengthOf(2);
            });
        });

        describe('through space-separated string (?fields=extensions categories)', () => {
            // Fetch the endpoint
            const path = '/whitelist?fields=extensions categories';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with the \'extensions\' and \'categories\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.be.an('object');
                expect(body).to.have.property('extensions').that.is.an('array');
                expect(body).to.have.property('categories').that.is.an('object');
            });
            it('has no other properties', async () => {
                expect(Object.keys(await response.json())).to.have.lengthOf(2);
            });
        });

        describe('through multiple query parameters (?fields=extensions&fields=categories)', () => {
            // Fetch the endpoint
            const path = '/whitelist?fields=extensions&fields=categories';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with the \'extensions\' and \'categories\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.be.an('object');
                expect(body).to.have.property('extensions').that.is.an('array');
                expect(body).to.have.property('categories').that.is.an('object');
            });
            it('has no other properties', async () => {
                expect(Object.keys(await response.json())).to.have.lengthOf(2);
            });
        });
    });

    describe('Requesting all fields (?fields=*)', () => {
        // Fetch the endpoint
        const path = '/whitelist?fields=*';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with \'extensions\' and \'categories\' properties', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.be.an('object');
            expect(body).to.have.property('extensions').that.is.an('array');
            expect(body).to.have.property('categories').that.is.an('object');
        });
        it('has no other properties', async () => {
            expect(Object.keys(await response.json())).to.have.lengthOf(2);
        });
    });
});
