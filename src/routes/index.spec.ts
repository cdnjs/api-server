import { describe, it, expect } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import { beforeRequest, request } from '../utils/spec/request.ts';

describe('/', () => {
    // Fetch the endpoint
    const path = '/';
    const response = beforeRequest(path, { redirect: 'manual' });

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response.headers.get('Cache-Control')).to.eq('public, max-age=30672000, immutable'); // 355 days
    });
    it('redirects to the cdnjs.com API docs as a 301', () => {
        expect(response.status).to.eq(301);
        expect(response.headers.get('Location')).to.eq('https://cdnjs.com/api');
    });
});

describe('/health', () => {
    // Fetch the endpoint
    const path = '/health';
    const response = beforeRequest(path);

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response.headers.get('Expires')).to.eq('0');
        expect(response.headers.get('Pragma')).to.eq('no-cache');
        expect(response.headers.get('Cache-Control')).to.eq('no-cache, no-store, must-revalidate');
    });
    it('returns the correct status code', () => {
        expect(response.status).to.eq(200);
    });
    it('returns on OK message', async () => {
        expect(response.headers.get('Content-Type')).to.match(/text\/plain/);
        expect(await response.text()).to.eq('OK');
    });

    // Test with a trailing slash
    it('responds to requests with a trailing slash', async () => {
        const res = await request(path + '/');
        expect(res.status).to.eq(200);
        expect(await res.text()).to.eq(await response.text());
    });
});

describe('/robots.txt', () => {
    // Fetch the endpoint
    const path = '/robots.txt';
    const response = beforeRequest(path);

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response.headers.get('Cache-Control')).to.eq('public, max-age=30672000, immutable'); // 355 days
    });
    it('returns the correct status code', () => {
        expect(response.status).to.eq(200);
    });
    it('disallows all indexing', async () => {
        expect(response.headers.get('Content-Type')).to.match(/text\/plain/);
        expect(await response.text()).to.eq('User-agent: *\nDisallow: /');
    });
});
