import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import {
    beforeRequest,
    externalApiUrl,
    request,
} from '../utils/spec/request.ts';
import testWebsite from '../utils/spec/website.ts';

describe('/', () => {
    // Fetch the endpoint
    const path = '/';

    describe('No query params', () => {
        const response = beforeRequest(path, { redirect: 'manual' });

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('redirects to the cdnjs.com API docs as a 301', () => {
            expect(response.status).to.eq(301);
            expect(response.headers.get('Location')).to.eq(
                'https://cdnjs.com/api',
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

describe('/health', () => {
    // Fetch the endpoint
    const path = '/health';

    describe('No query params', () => {
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
            expect(response.status).to.eq(200);
        });
        it('returns on OK message', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /text\/plain/,
            );
            expect(await response.text()).to.eq('OK');
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(await res.text()).to.eq(await response.text());
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Expires')).to.eq('0');
            expect(response.headers.get('Pragma')).to.eq('no-cache');
            expect(response.headers.get('Cache-Control')).to.eq(
                'no-cache, no-store, must-revalidate',
            );
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns on OK message', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /text\/plain/,
            );
            expect(await response.text()).to.eq('OK');
        });
    });
});

describe('/robots.txt', () => {
    // Fetch the endpoint
    const path = '/robots.txt';

    describe('No query params', () => {
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('disallows all indexing', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /text\/plain/,
            );
            expect(await response.text()).to.eq('User-agent: *\nDisallow: /');
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('disallows all indexing', async () => {
            expect(response.headers.get('Content-Type')).to.match(
                /text\/plain/,
            );
            expect(await response.text()).to.eq('User-agent: *\nDisallow: /');
        });
    });
});

describe('/favicon.ico', () => {
    // Fetch the endpoint
    const path = '/favicon.ico';

    describe('No query params', () => {
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/x-icon');
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/x-icon');
        });
    });
});

describe('/favicon.png', () => {
    // Fetch the endpoint
    const path = '/favicon.png';

    describe('No query params', () => {
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/png');
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/png');
        });
    });
});

describe('/favicon.svg', () => {
    // Fetch the endpoint
    const path = '/favicon.svg';

    describe('No query params', () => {
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/svg+xml');
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/svg+xml');
        });
    });
});

describe('/banner.png', () => {
    // Fetch the endpoint
    const path = '/banner.png';

    describe('No query params', () => {
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/png');
        });
    });

    // Don't run these tests against an external API Worker as can't set WEBSITE_BASE
    describe.skipIf(externalApiUrl)('Website React output', () => {
        // Fetch the endpoint
        const response = beforeRequest(path, {}, true);

        // Test the endpoint
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq(
                'public, max-age=30672000, immutable',
            ); // 355 days
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns the correct content type', () => {
            expect(response.headers.get('Content-Type')).to.eq('image/png');
        });
    });
});
