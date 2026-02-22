import type { Context } from 'hono';
import { env } from 'cloudflare:workers';

/**
 * Set cache headers on a response.
 *
 * @param ctx Request context.
 * @param age Age in seconds to cache response for (pass -1 to set no-cache headers).
 * @param immutable Mark the response as immutable for caching.
 */
export default (ctx: Context, age: number, immutable: boolean = false) => {
    if (age === -1 || env.DISABLE_CACHING) {
        ctx.header('Expires', '0');
        ctx.header('Pragma', 'no-cache');
        ctx.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
    }

    ctx.header('Expires',
        new Date(Date.now() + age * 1000).toUTCString());
    ctx.header('Cache-Control',
        [ 'public', `max-age=${age}`, immutable ? 'immutable' : null ].filter(x => !!x).join(', '));
};
