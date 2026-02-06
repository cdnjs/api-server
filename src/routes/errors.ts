import * as Sentry from '@sentry/cloudflare';

import cache from '../utils/cache.js';
import notFound from '../utils/notFound.js';
import respond from '../utils/respond.js';

/**
 * Register error handlers for routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    // Pass request context to Sentry
    app.use('*', async (ctx, next) => {
        Sentry.setTags({
            requestId: crypto.randomUUID(),
            userAgent: ctx.req.header('user-agent'),
            ray: ctx.req.header('cf-ray'),
            country: ctx.req.raw.cf?.country,
            colo: ctx.req.raw.cf?.colo,
        });

        Sentry.setUser({
            ip: ctx.req.header('cf-connecting-ip') || ctx.req.header('x-forwarded-for'),
            userAgent: ctx.req.header('user-agent'),
            colo: ctx.req.raw.cf?.colo,
        });

        await next();
    });

    // Handle 404s
    app.notFound(ctx => notFound(ctx, 'Endpoint'));

    // Emit a test error
    app.get('/error', async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
        throw new Error('Test error');
    });

    // Handle errors
    app.onError((err, ctx) => {
        // Log the error
        console.error(err.stack);
        const sentry = Sentry.captureException(err);

        // Never cache this
        cache(ctx, -1);

        // Send the error response
        ctx.status(500);
        return respond(ctx, {
            error: true,
            status: 500,
            message: err.message,
            ref: sentry,
        });
    });
};
