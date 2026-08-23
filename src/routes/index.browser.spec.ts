import { XMLParser } from 'fast-xml-parser';

import { expect, test } from '../utils/spec/playwright.ts';

interface Sitemap {
    urlset?: {
        '@_xmlns'?: string;
        url?: { loc?: string } | { loc?: string }[];
    };
}

interface OpenSearch {
    OpenSearchDescription?: {
        '@_xmlns'?: string;
        '@_xmlns:moz'?: string;
        ShortName?: string;
        Url?: {
            '@_type'?: string;
            '@_method'?: string;
            '@_template'?: string;
        };
    };
}

test.describe('/', () => {
    test('renders page', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=21600',
        ); // 6 hours

        await expect(page).toHaveTitle('cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/',
        );

        await expect(
            page.getByRole('heading', {
                name: 'The free CDN for open source libraries.',
            }),
        ).toBeVisible();

        const input = page.getByRole('textbox', {
            name: 'Search libraries on cdnjs...',
        });
        await expect(input).toBeVisible();
        await input.focus();

        await expect(
            page.getByRole('link', { name: 'View all' }),
        ).toBeVisible();

        const initial = page.getByRole('link', { name: /^.+ @/ }).first();
        await expect(initial).toBeVisible();
        await expect(initial).toHaveAttribute(
            'href',
            `/libraries/${(await initial.innerText()).match(/^(.+) @/)?.[1]}`,
        );

        await input.fill('backbone.js');

        const result = page.getByRole('link', { name: /^backbone\.js @/ });
        await expect(result).toBeVisible();
        await result.click();
        await expect(page).toHaveURL('/libraries/backbone.js');
    });
});

test.describe('/health', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/health');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'no-cache, no-store, must-revalidate',
        );
        expect(response?.headers()['expires']).toBe('0');
        expect(response?.headers()['pragma']).toBe('no-cache');
        expect(response?.headers()['content-type']).toMatch(
            /^text\/plain(;|$)/,
        );
        expect(await response?.text()).toBe('OK');
    });
});

test.describe('/robots.txt', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/robots.txt');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=30672000, immutable',
        ); // 355 days
        expect(response?.headers()['content-type']).toMatch(
            /^text\/plain(;|$)/,
        );
        expect(await response?.text()).toBe('User-agent: *\nDisallow: /');
    });
});

test.describe('/opensearch.xml', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/opensearch.xml');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=30672000, immutable',
        ); // 355 days
        expect(response?.headers()['content-type']).toMatch(
            /^application\/opensearchdescription\+xml(;|$)/,
        );

        const body = await response.text();
        const origin = new URL(response.url()).origin;
        const opensearch = new XMLParser({
            ignoreAttributes: false,
        }).parse(body) as unknown as OpenSearch;
        const description = opensearch.OpenSearchDescription;

        expect(description?.['@_xmlns']).toBe(
            'http://a9.com/-/spec/opensearch/1.1/',
        );
        expect(description?.['@_xmlns:moz']).toBe(
            'http://www.mozilla.org/2006/browser/search/',
        );
        expect(description?.ShortName).toBe('cdnjs');
        expect(description?.Url?.['@_type']).toBe('text/html');
        expect(description?.Url?.['@_method']).toBe('GET');
        expect(description?.Url?.['@_template']).toBe(
            `${origin}/libraries?search={searchTerms}`,
        );
    });
});

test.describe('/sitemap.xml', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/sitemap.xml');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=21600',
        ); // 6 hours
        expect(response?.headers()['content-type']).toMatch(
            /^application\/xml(;|$)/,
        );

        const body = await response.text();
        const origin = new URL(response.url()).origin;
        const sitemap = new XMLParser({
            ignoreAttributes: false,
        }).parse(body) as unknown as Sitemap;
        const urls = sitemap.urlset?.url;

        expect(sitemap.urlset?.['@_xmlns']).toBe(
            'http://www.sitemaps.org/schemas/sitemap/0.9',
        );
        expect(Array.isArray(urls)).toBe(true);
        if (!Array.isArray(urls)) throw new Error('Missing sitemap URLs');

        const locations = urls.map((url) => url.loc);
        expect(locations).toContain(`${origin}/`);
        expect(locations).toContain(`${origin}/about`);
        expect(locations).toContain(`${origin}/api`);
        expect(locations).toContain(`${origin}/libraries`);
        expect(locations).toContain(`${origin}/libraries/backbone.js`);
        expect(locations).not.toContain(
            `${origin}/libraries/backbone.js/1.1.0`,
        );
    });
});

test.describe('/favicon.ico', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/favicon.ico');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=30672000, immutable',
        ); // 355 days
        expect(response?.headers()['content-type']).toMatch(
            /^image\/x-icon(;|$)/,
        );
    });
});

test.describe('/favicon.png', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/favicon.png');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=30672000, immutable',
        ); // 355 days
        expect(response?.headers()['content-type']).toMatch(/^image\/png(;|$)/);
    });
});

test.describe('/favicon.svg', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/favicon.svg');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=30672000, immutable',
        ); // 355 days
        expect(response?.headers()['content-type']).toMatch(
            /^image\/svg\+xml(;|$)/,
        );
    });
});

test.describe('/banner.png', () => {
    test('valid response', async ({ page }) => {
        const response = await page.request.get('/banner.png');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=30672000, immutable',
        ); // 355 days
        expect(response?.headers()['content-type']).toMatch(/^image\/png(;|$)/);
    });
});
