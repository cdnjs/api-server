import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import {
    beforeRequest,
    externalApiUrl,
    request,
} from '../utils/spec/request.ts';
import testWebsite from '../utils/spec/website.ts';

describe('/about', () => {
    // Fetch the endpoint
    const path = '/about';

    describe('No query params', () => {
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
            expect(res.headers.get('Location')).to.eq(
                'https://cdnjs.com/about',
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
                'public, max-age=21600',
            ); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        testWebsite(response);
    });
});
