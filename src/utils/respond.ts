import { cache } from '@emotion/css';
import { env } from 'cloudflare:workers';
import type { Context } from 'hono';
import { type ComponentType, createElement } from 'react';
import { prerender } from 'react-dom/static';

import type { ErrorResponse } from '../routes/errors.schema.ts';

import { createIslandProvider } from './jsx/island.tsx';
import Json from './jsx/json.tsx';
import Layout, { type Meta } from './jsx/layout.tsx';

/**
 * Extract the critical CSS from Emotion for a given HTML string.
 *
 * Reimplementation of https://github.com/emotion-js/emotion/blob/%40emotion/server%4011.11.0/packages/server/src/create-instance/extract-critical.js
 *  without the reliance on Node.js APIs from other parts of the \@emotion/server package.
 *
 * @param html HTML to extract critical CSS from.
 * @returns Critical CSS for the given HTML string.
 */
const getCriticalEmotionCss = (html: string) => {
    const seen = new Set<string>();
    for (const match of html.matchAll(
        new RegExp(`${cache.key}-([A-Za-z0-9_-]+)`, 'g'),
    )) {
        const id = match[1];
        if (!id || seen.has(id)) {
            continue;
        }
        seen.add(id);
    }

    let css = '';
    const ids = Object.keys(cache.inserted).filter((id) => {
        if (
            (seen.has(id) ||
                cache.registered[`${cache.key}-${id}`] === undefined) &&
            cache.inserted[id] !== true
        ) {
            css += cache.inserted[id];
            return true;
        }
        return false;
    });

    return `<style data-emotion="${cache.key} ${ids.join(' ')}">${css}</style>`;
};

/**
 * Set cache headers on an API response.
 *
 * @param ctx Request context.
 * @param age Age in seconds to cache response for (pass -1 to set no-cache headers).
 * @param immutable Mark the response as immutable for caching.
 */
export const withCache = (ctx: Context, age: number, immutable = false) => {
    if (age === -1 || env.DISABLE_CACHING) {
        ctx.header('Expires', '0');
        ctx.header('Pragma', 'no-cache');
        ctx.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
    }

    ctx.header('Expires', new Date(Date.now() + age * 1000).toUTCString());
    ctx.header(
        'Cache-Control',
        ['public', `max-age=${age}`, immutable ? 'immutable' : null]
            .filter((x) => !!x)
            .join(', '),
    );
};

/**
 * Check if the request is from the website base URL, and should get a React response, instead of a JSON response for API requests.
 *
 * Supports a wildcard port to be used for local development.
 *
 * @param ctx Request context.
 */
export const isWebsite = (ctx: Context) => {
    if (!env.WEBSITE_BASE) return false;

    const { origin } = new URL(ctx.req.url);
    return (
        origin === env.WEBSITE_BASE ||
        (env.WEBSITE_BASE.endsWith(':*') &&
            origin.replace(/:\d+$/, '') ===
                env.WEBSITE_BASE.replace(/:\*$/, ''))
    );
};

/**
 * Respond to a request with data, handling if it should be returned as JSON or rendered as a React response.
 *
 * @param ctx Request context.
 * @param data Data to be included in the response.
 * @param component Optional custom component to use for website React output (defaults to Json).
 * @param meta Optional metadata overrides to use for the website React output (defaults to the standard cdnjs metadata).
 */
const respond = async <T = never>(
    ctx: Context,
    data: NoInfer<T>,
    component: ComponentType<{ data: NoInfer<T> }> = Json,
    meta?: Partial<Meta>,
) => {
    if (isWebsite(ctx)) {
        // Browsers are able to cache website pages, but should always revalidate to ensure fresh content
        // For error responses, we set a no-cache cache-control header, so don't override that here
        if (!ctx.res.headers.has('Cache-Control')) {
            if (env.DISABLE_CACHING) {
                withCache(ctx, -1);
            } else {
                ctx.header('Expires', '0');
                ctx.header(
                    'Cache-Control',
                    'public, max-age=0, must-revalidate',
                );
            }
        }

        // Only the production site at cdnjs.com should ever be indexable
        if (env.WEBSITE_BASE !== 'https://cdnjs.com') {
            ctx.header('X-Robots-Tag', 'noindex');
        }

        const Provider = await createIslandProvider();
        const { prelude } = await prerender(
            createElement(
                Provider,
                null,
                createElement(
                    Layout,
                    {
                        meta: {
                            title: [meta?.title, 'cdnjs']
                                .filter((x) => !!x)
                                .join(' - '),
                            description: [
                                meta?.description,
                                "cdnjs is the free, open-source CDN for the web's most popular libraries. JavaScript, CSS, and font resources, globally cached on Cloudflare's network. Trusted by 12.5% of all websites, serving 250 billion requests per month.",
                            ]
                                .filter((x) => !!x)
                                .join(' '),
                            keywords: [
                                ...new Set([
                                    ...(meta?.keywords ?? []),
                                    'cdn',
                                    'cache',
                                    'cdnjs',
                                    'cloudflare',
                                    'js',
                                    'javascript',
                                    'css',
                                    'font',
                                    'fonts',
                                    'library',
                                    'package',
                                    'resource',
                                    'web',
                                    'frontend',
                                    'front-end',
                                    'free',
                                    'open-source',
                                    'open source',
                                    'oss',
                                    'npm',
                                    'github',
                                ]),
                            ],
                            canonical: meta?.canonical ?? ctx.req.path,
                        },
                    },
                    createElement(component, { data }),
                ),
            ),
        );
        const body = await new Response(prelude).text();
        const styles = getCriticalEmotionCss(body);

        return ctx.html(
            body.includes('</head>')
                ? body.replace('</head>', `${styles}</head>`)
                : `${styles}${body}`,
        );
    }

    return ctx.json(data);
};

export default respond;

/**
 * Respond to a request where a resource wasn't found.
 *
 * @param ctx Request context.
 * @param resource Resource that was not found.
 */
export const notFound = (ctx: Context, resource: string) => {
    // Set a 1 hour life on this response
    if (!isWebsite(ctx)) {
        withCache(ctx, 60 * 60);
    }

    // Send the error response
    ctx.status(404);
    return respond<ErrorResponse>(
        ctx,
        {
            error: true,
            status: 404,
            message: `${resource} not found`,
        },
        Json,
        { title: `${resource} Not Found` },
    );
};
