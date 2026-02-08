import { describe, it, expect } from 'vitest';

import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';
import { beforeRequest, request } from '../utils/spec/request.js';

describe('/this-route-doesnt-exist', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/this-route-doesnt-exist';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=3600'); // 1 hour
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(404);
        });
        it('returns a JSON body that is a valid error response', () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('error', true);
            expect(response.body).to.have.property('status', 404);
            expect(response.body).to.have.property('message', 'Endpoint not found');
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/this-route-doesnt-exist?output=human';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=3600'); // 1 hour
        });
        testHuman(response);
    });
});

describe('/error', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/error';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Expires')).to.eq('0');
            expect(response.headers.get('Pragma')).to.eq('no-cache');
            expect(response.headers.get('Cache-Control')).to.eq('no-cache, no-store, must-revalidate');
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(500);
        });
        it('returns a JSON body that is a valid error response', () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('error', true);
            expect(response.body).to.have.property('status', 500);
            expect(response.body).to.have.property('message', 'Test error');
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/error?output=human';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Expires')).to.eq('0');
            expect(response.headers.get('Pragma')).to.eq('no-cache');
            expect(response.headers.get('Cache-Control')).to.eq('no-cache, no-store, must-revalidate');
        });
        testHuman(response);
    });
});
