import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import {
    beforeRequest,
    externalApiUrl,
    request,
} from '../utils/spec/request.ts';
import testWebsite from '../utils/spec/website.ts';

import type { StatsResponse } from './stats.schema.ts';

describe('/stats', () => {
    const path = '/stats';

    describe('No query params', () => {
        // Fetch the endpoint
        const response = beforeRequest(path);

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
        it('returns a JSON body that is a stats object', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /application\/json/,
            );
            expect(await response.json<StatsResponse>()).to.be.an('object');
        });
        describe('cdnjs stats object', () => {
            it("is an object with the 'libraries' property", async () => {
                expect(await response.json<StatsResponse>())
                    .to.have.property('libraries')
                    .that.is.an('number');
            });
            it('has no other properties', async () => {
                expect(
                    Object.keys(await response.json<StatsResponse>()),
                ).to.have.lengthOf(1);
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(await res.json<StatsResponse>()).to.deep.equal(
                await response.json<StatsResponse>(),
            );
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=3600',
            ); // 1 hour
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(404);
        });
        testWebsite(response);
    });
});
