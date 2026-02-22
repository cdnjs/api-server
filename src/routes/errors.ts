import type { Hono } from 'hono';
import * as Sentry from '@sentry/cloudflare';

import cache from '../utils/cache.ts';
import notFound from '../utils/notFound.ts';
import respond from '../utils/respond.ts';

const stringOrUndefined = (value: unknown) => typeof value === 'string' ? value : undefined;

/**
 * Register error handlers for routes.
 *
 * @param app App instance.
 */
export default (app: Hono) => {
    // Pass request context to Sentry
    app.use('*', async (ctx, next) => {
        Sentry.setTags({
            requestId: crypto.randomUUID(),
            userAgent: ctx.req.header('user-agent'),
            ray: ctx.req.header('cf-ray'),
            country: stringOrUndefined(ctx.req.header('cf-country')),
            colo: stringOrUndefined(ctx.req.header('cf-colo')),
        });

        Sentry.setUser({
            ip: ctx.req.header('cf-connecting-ip') || ctx.req.header('x-forwarded-for'),
            userAgent: ctx.req.header('user-agent'),
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
