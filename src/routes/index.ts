import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import XMLBuilder from 'fast-xml-builder';
import type { Context, Hono } from 'hono';

import bannerPng from '../assets/banner.png';
import faviconIco from '../assets/favicon.ico';
import faviconPng from '../assets/favicon.png';
import faviconSvg from '../assets/favicon.svg';
import { libraries } from '../utils/metadata.ts';
import respond, { isWebsite, notFound, withCache } from '../utils/respond.ts';

import IndexPage from './index.page.tsx';

/**
 * Handle GET / requests.
 *
 * @param ctx Request context.
 */
const handleGet = (ctx: Context) => {
    // Render the React page for website requests
    if (isWebsite(ctx)) {
        // Set a 6 hour life on this response
        withCache(ctx, 6 * 60 * 60);

        return respond<undefined>(ctx, undefined, IndexPage);
    }

    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Redirect to the API docs
    return ctx.redirect('https://cdnjs.com/api', 301);
};

/**
 * Handle GET /health requests.
 *
 * @param ctx Request context.
 */
const handleGetHealth = (ctx: Context) => {
    // Don't cache health, ensure its always live
    withCache(ctx, -1);

    // Respond
    return ctx.text('OK');
};

/**
 * Handle GET /robots.txt requests.
 *
 * @param ctx Request context.
 */
const handleGetRobotsTxt = (ctx: Context) => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Disallow all robots
    return ctx.text('User-agent: *\nDisallow: /');
};

/**
 * Handle GET /opensearch.xml requests.
 *
 * @param ctx Request context.
 */
const handleGetOpenSearchXml = (ctx: Context) => {
    // Only serve OpenSearch for website requests
    if (!isWebsite(ctx)) {
        return notFound(ctx, 'Endpoint');
    }

    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    const origin = new URL(ctx.req.url).origin;
    const opensearch = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
        suppressEmptyNode: true,
    }).build({
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        OpenSearchDescription: {
            '@_xmlns': 'http://a9.com/-/spec/opensearch/1.1/',
            '@_xmlns:moz': 'http://www.mozilla.org/2006/browser/search/',
            ShortName: 'cdnjs',
            Description:
                "cdnjs is the free, open-source CDN for the web's most popular libraries. JavaScript, CSS, and font resources, globally cached on Cloudflare's network. Trusted by 12.5% of all websites, serving 250 billion requests per month.",
            InputEncoding: 'UTF-8',
            Image: [
                {
                    '@_type': 'image/x-icon',
                    '#text': `${origin}/favicon.ico`,
                },
                {
                    '@_type': 'image/png',
                    '#text': `${origin}/favicon.png`,
                },
                {
                    '@_type': 'image/svg+xml',
                    '#text': `${origin}/favicon.svg`,
                },
            ],
            Url: {
                '@_type': 'text/html',
                '@_method': 'GET',
                '@_template': `${origin}/libraries?search={searchTerms}`,
            },
        },
    });

    return ctx.body(opensearch, 200, {
        'Content-Type': 'application/opensearchdescription+xml',
    });
};

/**
 * Handle GET /sitemap.xml requests.
 *
 * @param ctx Request context.
 */
const handleGetSitemapXml = async (ctx: Context) => {
    // Only serve a sitemap for website requests
    if (!isWebsite(ctx)) {
        return notFound(ctx, 'Endpoint');
    }

    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

    const origin = new URL(ctx.req.url).origin;
    const libraryPaths = (await libraries()).map(
        (name) => `/libraries/${encodeURIComponent(name)}`,
    );
    const sitemap = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
        suppressEmptyNode: true,
    }).build({
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        urlset: {
            '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
            url: ['/', '/about', '/api', '/libraries', ...libraryPaths].map(
                (path) => ({
                    loc: `${origin}${path}`,
                }),
            ),
        },
    });

    return ctx.body(sitemap, 200, {
        'Content-Type': 'application/xml',
    });
};

/**
 * Handle GET /favicon.ico requests.
 *
 * @param ctx Request context.
 */
const handleGetFaviconIco = (ctx: Context) => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Respond
    return ctx.body(faviconIco, 200, {
        'Content-Type': 'image/x-icon',
    });
};

/**
 * Handle GET /favicon.png requests.
 *
 * @param ctx Request context.
 */
const handleGetFaviconPng = (ctx: Context) => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Respond
    return ctx.body(faviconPng, 200, {
        'Content-Type': 'image/png',
    });
};

/**
 * Handle GET /favicon.svg requests.
 *
 * @param ctx Request context.
 */
const handleGetFaviconSvg = (ctx: Context) => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Respond
    return ctx.body(faviconSvg, 200, {
        'Content-Type': 'image/svg+xml',
    });
};

/**
 * Handle GET /banner.png requests.
 *
 * @param ctx Request context.
 */
const handleGetBannerPng = (ctx: Context) => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Respond (only used by the website but accessible via the API as well)
    return ctx.body(bannerPng, 200, {
        'Content-Type': 'image/png',
    });
};

/**
 * Register core routes.
 *
 * @param app App instance.
 * @param _registry OpenAPI registry instance.
 */
export default (app: Hono, _registry: OpenAPIRegistry) => {
    // Redirect root the API docs
    app.get('/', handleGet);

    // Respond that the API is up
    app.get('/health', handleGetHealth);
    app.get('/health/', handleGetHealth);

    // Don't ever index anything on the API
    app.get('/robots.txt', handleGetRobotsTxt);

    // Provide OpenSearch support for the website
    app.get('/opensearch.xml', handleGetOpenSearchXml);

    // Provide a sitemap for the website
    app.get('/sitemap.xml', handleGetSitemapXml);

    // Serve the favicon assets
    app.get('/favicon.ico', handleGetFaviconIco);
    app.get('/favicon.png', handleGetFaviconPng);
    app.get('/favicon.svg', handleGetFaviconSvg);
    app.get('/banner.png', handleGetBannerPng);
};
