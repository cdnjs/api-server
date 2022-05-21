import cache from '../utils/cache.js';
import notFound from '../utils/notFound.js';
import respond from '../utils/respond.js';

/**
 * Register error handlers for routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    // Handle 404s
    app.notFound(ctx => notFound(ctx, 'Endpoint'));

    // Handle errors
    app.onError((err, ctx) => {
        // Log the error
        console.error(err.stack);
        // TODO: Sentry.captureException(err);

        // Never cache this
        cache(ctx, -1);

        // Send the error response
        ctx.status(500);
        return respond(ctx, {
            error: true,
            status: 500,
            message: err.message,
        });
    });
};
