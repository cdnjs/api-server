import { describe, it, expect } from 'vitest';

import testCors from '../utils/spec/cors.js';
import { beforeRequest, request } from '../utils/spec/request.js';

describe('/', () => {
    // Fetch the endpoint
    const path = '/';
    const response = beforeRequest(path, { redirect: 'manual' });

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
    });
    it('redirects to the cdnjs.com API docs as a 301', () => {
        expect(response).to.have.status(301);
        expect(response).to.redirectTo('https://cdnjs.com/api');
    });
});

describe('/health', () => {
    // Fetch the endpoint
    const path = '/health';
    const response = beforeRequest(path);

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response).to.have.header('Expires', '0');
        expect(response).to.have.header('Pragma', 'no-cache');
        expect(response).to.have.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    });
    it('returns the correct status code', () => {
        expect(response).to.have.status(200);
    });
    it('returns on OK message', () => {
        expect(response).to.be.text;
        expect(response.text).to.eq('OK');
    });

    // Test with a trailing slash
    it('responds to requests with a trailing slash', async () => {
        const res = await request(path + '/');
        expect(res).to.have.status(200);
        expect(res.text).to.eq(response.text);
    });
});

describe('/robots.txt', () => {
    // Fetch the endpoint
    const path = '/robots.txt';
    const response = beforeRequest(path);

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
    });
    it('returns the correct status code', () => {
        expect(response).to.have.status(200);
    });
    it('disallows all indexing', () => {
        expect(response).to.be.text;
        expect(response.text).to.eq('User-agent: *\nDisallow: /');
    });
});
