import { cache } from '@emotion/css';
import { env } from 'cloudflare:workers';
import type { Context } from 'hono';
import { type ComponentType, createElement } from 'react';
import { renderToString } from 'react-dom/server';

import type { ErrorResponse } from '../routes/errors.schema.ts';

import event from './event.ts';
import { createIslandProvider } from './jsx/island.tsx';
import Json from './jsx/json.tsx';
import Layout from './jsx/layout.tsx';

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
 * Set cache headers on a response.
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
 * Respond to a request with data, handling if it should be returned as JSON or pretty-printed in HTML.
 *
 * @param ctx Request context.
 * @param data Data to be included in the response.
 * @param component Optional custom component to use for human-readable output (defaults to Json).
 */
const respond = async <T = never>(
    ctx: Context,
    data: NoInfer<T>,
    component: ComponentType<{ data: NoInfer<T> }> = Json,
) => {
    if (ctx.req.query('output') === 'human') {
        event('human-output', { ctx });
        ctx.header('X-Robots-Tag', 'noindex');

        const Provider = await createIslandProvider();
        const body = renderToString(
            createElement(
                Provider,
                null,
                createElement(Layout, null, createElement(component, { data })),
            ),
        );
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
    // Set a 1 hour on this response
    withCache(ctx, 60 * 60);

    // Send the error response
    ctx.status(404);
    return respond<ErrorResponse>(ctx, {
        error: true,
        status: 404,
        message: `${resource} not found`,
    });
};
