import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { env } from 'cloudflare:workers';
import type { Context, Hono } from 'hono';

import { withCache } from '../utils/respond.ts';

/**
 * Handle GET / requests.
 *
 * @param ctx Request context.
 */
const handleGet = (ctx: Context) => {
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
};
