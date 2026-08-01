import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import { beforeRequest, request } from '../utils/spec/request.ts';

describe('/about', () => {
    // Fetch the endpoint
    const path = '/about';
    const response = beforeRequest(path, { redirect: 'manual' });

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response.headers.get('Cache-Control')).to.eq(
            'public, max-age=30672000, immutable',
        ); // 355 days
    });
    it('redirects to the cdnjs.com about page as a 301', () => {
        expect(response.status).to.eq(301);
        expect(response.headers.get('Location')).to.eq(
            'https://cdnjs.com/about',
        );
    });

    // Test with a trailing slash
    it('responds to requests with a trailing slash', async () => {
        const res = await request(path + '/', { redirect: 'manual' });
        expect(res.status).to.eq(301);
        expect(res.headers.get('Location')).to.eq('https://cdnjs.com/about');
    });
});
