/* global DISABLE_CACHING */

/**
 * Set cache headers on a response.
 *
 * @param {import('hono').Context} ctx Request context.
 * @param {number} age Age in seconds to cache response for (pass -1 to set no-cache headers).
 * @param {boolean} [immutable=false] Mark the response as immutable for caching.
 */
export default (ctx, age, immutable = false) => {
    if (age === -1 || DISABLE_CACHING === 'true') {
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
