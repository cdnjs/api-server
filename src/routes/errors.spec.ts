import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import { beforeRequest, externalApiUrl } from '../utils/spec/request.ts';

import type { ErrorResponse } from './errors.schema.ts';

describe('/this-route-doesnt-exist', () => {
    const path = '/this-route-doesnt-exist';

    describe('No query params', () => {
        // Fetch the endpoint
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=3600',
            ); // 1 hour
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(404);
        });
        it('returns a JSON body that is a valid error response', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /application\/json/,
            );

            const body = await response.json<ErrorResponse>();
            expect(body).to.be.an('object');
            expect(body).to.have.property('error', true);
            expect(body).to.have.property('status', 404);
            expect(body).to.have.property('message', 'Endpoint not found');
        });
    });
});

// Don't run these tests against an external API Worker as we don't want to create noise
describe.skipIf(externalApiUrl)('/error', () => {
    const path = '/error';

    describe('No query params', () => {
        // Fetch the endpoint
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Expires')).to.eq('0');
            expect(response.headers.get('Pragma')).to.eq('no-cache');
            expect(response.headers.get('Cache-Control')).to.eq(
                'no-cache, no-store, must-revalidate',
            );
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(500);
        });
        it('returns a JSON body that is a valid error response', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /application\/json/,
            );

            const body = await response.json<ErrorResponse>();
            expect(body).to.be.an('object');
            expect(body).to.have.property('error', true);
            expect(body).to.have.property('status', 500);
            expect(body).to.have.property(
                'message',
                'An unexpected error occurred',
            );
        });
    });
});
