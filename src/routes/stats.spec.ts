import { describe, it, expect } from 'vitest';

import type { StatsResponse } from './stats.schema.ts';
import testCors from '../utils/spec/cors.ts';
import testHuman from '../utils/spec/human.ts';
import { beforeRequest, request } from '../utils/spec/request.ts';

describe('/stats', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/stats';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body that is a stats object', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);
            expect(await response.json<StatsResponse>()).to.be.an('object');
        });
        describe('cdnjs stats object', () => {
            it('is an object with the \'libraries\' property', async () => {
                expect(await response.json<StatsResponse>()).to.have.property('libraries').that.is.an('number');
            });
            it('has no other properties', async () => {
                expect(Object.keys(await response.json<StatsResponse>())).to.have.lengthOf(1);
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(await res.json<StatsResponse>()).to.deep.equal(await response.json<StatsResponse>());
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/stats?output=human';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        testHuman(response);
    });
});
