import { env } from 'cloudflare:workers';

import cache from '../utils/cache';

/**
 * Handle GET / requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Response}
 */
const handleGet = ctx => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    cache(ctx, 355 * 24 * 60 * 60, true);

    // Redirect to the API docs
    return ctx.redirect('https://cdnjs.com/api', 301);
};

/**
 * Handle GET /health requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Response}
 */
const handleGetHealth = ctx => {
    // Don't cache health, ensure its always live
    cache(ctx, -1);

    // If we have a known release, include a header for it
    if (env.SENTRY_RELEASE) {
        ctx.header('X-Release', env.SENTRY_RELEASE);
    }

    // Respond
    return ctx.text('OK');
};

/**
 * Handle GET /robots.txt requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Response}
 */
const handleGetRobotsTxt = ctx => {
    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    cache(ctx, 355 * 24 * 60 * 60, true);

    // Disallow all robots
    return ctx.text('User-agent: *\nDisallow: /');
};

/**
 * Register core routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    // Redirect root the API docs
    app.get('/', handleGet);

    // Respond that the API is up
    app.get('/health', handleGetHealth);
    app.get('/health/', handleGetHealth);

    // Don't ever index anything on the API
    app.get('/robots.txt', handleGetRobotsTxt);
};
