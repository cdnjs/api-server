import { cache } from '@emotion/css';
import { env } from 'cloudflare:workers';
import type { Context } from 'hono';

import type { ErrorResponse } from '../routes/errors.schema.ts';

import event from './event.ts';
import Json from './jsx/json.tsx';

/**
 * Extract the critical CSS from Emotion for a given HTML string.
 *
 * @param html HTML to extract critical CSS from.
 * @returns Critical CSS for the given HTML string.
 */
const getCriticalEmotionCss = (html: string) => {
    const ids: string[] = [];
    const seen = new Set<string>();
    const classNamePattern = new RegExp(`${cache.key}-([A-Za-z0-9_-]+)`, 'g');

    for (const match of html.matchAll(classNamePattern)) {
        const id = match[1];
        if (!id || seen.has(id)) {
            continue;
        }

        const rule = cache.inserted[id];
        if (typeof rule === 'string') {
            ids.push(id);
            seen.add(id);
        }
    }

    return ids
        .map((id) => cache.inserted[id])
        .filter((rule): rule is string => typeof rule === 'string')
        .join('');
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
 */
const respond = async <T = never>(ctx: Context, data: NoInfer<T>) => {
    if (ctx.req.query('output') === 'human') {
        event('human-output', { ctx });
        ctx.header('X-Robots-Tag', 'noindex');

        const response = await ctx.render(Json({ json: data }));
        const body = await response.text();
        const styles = `<style>${getCriticalEmotionCss(body)}</style>`;

        return new Response(
            body.includes('</head>')
                ? body.replace('</head>', `${styles}</head>`)
                : `${styles}${body}`,
            response,
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
