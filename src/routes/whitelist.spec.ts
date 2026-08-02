import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import {
    beforeRequest,
    externalApiUrl,
    request,
} from '../utils/spec/request.ts';
import testWebsite from '../utils/spec/website.ts';

import type { WhitelistResponse } from './whitelist.schema.ts';

describe('/whitelist', () => {
    const path = '/whitelist';

    describe('No query params', () => {
        // Fetch the endpoint
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=21600',
            ); // 6 hours;
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it("returns a JSON body with 'extensions' and 'categories' properties", async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /application\/json/,
            );

            const body = await response.json<WhitelistResponse>();
            expect(body).to.be.an('object');
            expect(body).to.have.property('extensions').that.is.an('array');
            expect(body).to.have.property('categories').that.is.an('object');
        });
        it('has no other properties', async () => {
            expect(
                Object.keys(await response.json<WhitelistResponse>()),
            ).to.have.lengthOf(2);
        });
        describe('Extensions array', () => {
            it('only has string elements', async () => {
                const body = await response.json<WhitelistResponse>();
                for (const result of body.extensions!) {
                    expect(result).to.be.a('string');
                }
            });
        });
        describe('Categories object', () => {
            it("has a key for each value in 'extensions'", async () => {
                const body = await response.json<WhitelistResponse>();
                const keys = Object.keys(body.categories!);
                for (const result of body.extensions!) {
                    expect(keys).to.include(result);
                }
            });
            it('has a string value for each key', async () => {
                const body = await response.json<WhitelistResponse>();
                for (const result of Object.values(body.categories!)) {
                    expect(result).to.be.a('string');
                }
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(await res.json<WhitelistResponse>()).to.deep.equal(
                await response.json<WhitelistResponse>(),
            );
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=21600',
            ); // 6 hours
        });
        testWebsite(response);
    });

    describe('Requesting a field (?fields=extensions)', () => {
        // Fetch the endpoint
        const response = beforeRequest(`${path}?fields=extensions`);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=21600',
            ); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it("returns a JSON body with the 'extensions' property", async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /application\/json/,
            );

            const body = await response.json<WhitelistResponse>();
            expect(body).to.be.an('object');
            expect(body).to.have.property('extensions').that.is.an('array');
        });
        it('has no other properties', async () => {
            expect(
                Object.keys(await response.json<WhitelistResponse>()),
            ).to.have.lengthOf(1);
        });
    });

    describe('Requesting multiple fields', () => {
        describe('through comma-separated string (?fields=extensions,categories)', () => {
            // Fetch the endpoint
            const response = beforeRequest(
                `${path}?fields=extensions,categories`,
            );

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq(
                    'public, max-age=21600',
                ); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it("returns a JSON body with the 'extensions' and 'categories' properties", async () => {
                expect(response.headers.get('Content-Type')).to.match(
                    /application\/json/,
                );

                const body = await response.json<WhitelistResponse>();
                expect(body).to.be.an('object');
                expect(body).to.have.property('extensions').that.is.an('array');
                expect(body)
                    .to.have.property('categories')
                    .that.is.an('object');
            });
            it('has no other properties', async () => {
                expect(
                    Object.keys(await response.json<WhitelistResponse>()),
                ).to.have.lengthOf(2);
            });
        });

        describe('through space-separated string (?fields=extensions categories)', () => {
            // Fetch the endpoint
            const response = beforeRequest(
                `${path}?fields=extensions categories`,
            );

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq(
                    'public, max-age=21600',
                ); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it("returns a JSON body with the 'extensions' and 'categories' properties", async () => {
                expect(response.headers.get('Content-Type')).to.match(
                    /application\/json/,
                );

                const body = await response.json<WhitelistResponse>();
                expect(body).to.be.an('object');
                expect(body).to.have.property('extensions').that.is.an('array');
                expect(body)
                    .to.have.property('categories')
                    .that.is.an('object');
            });
            it('has no other properties', async () => {
                expect(
                    Object.keys(await response.json<WhitelistResponse>()),
                ).to.have.lengthOf(2);
            });
        });

        describe('through multiple query parameters (?fields=extensions&fields=categories)', () => {
            // Fetch the endpoint
            const response = beforeRequest(
                `${path}?fields=extensions&fields=categories`,
            );

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq(
                    'public, max-age=21600',
                ); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it("returns a JSON body with the 'extensions' and 'categories' properties", async () => {
                expect(response.headers.get('Content-Type')).to.match(
                    /application\/json/,
                );

                const body = await response.json<WhitelistResponse>();
                expect(body).to.be.an('object');
                expect(body).to.have.property('extensions').that.is.an('array');
                expect(body)
                    .to.have.property('categories')
                    .that.is.an('object');
            });
            it('has no other properties', async () => {
                expect(
                    Object.keys(await response.json<WhitelistResponse>()),
                ).to.have.lengthOf(2);
            });
        });
    });

    describe('Requesting all fields (?fields=*)', () => {
        // Fetch the endpoint
        const response = beforeRequest(`${path}?fields=*`);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=21600',
            ); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it("returns a JSON body with 'extensions' and 'categories' properties", async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /application\/json/,
            );

            const body = await response.json<WhitelistResponse>();
            expect(body).to.be.an('object');
            expect(body).to.have.property('extensions').that.is.an('array');
            expect(body).to.have.property('categories').that.is.an('object');
        });
        it('has no other properties', async () => {
            expect(
                Object.keys(await response.json<WhitelistResponse>()),
            ).to.have.lengthOf(2);
        });
    });
});
