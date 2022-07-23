import cache from '../utils/cache.js';
import { library } from '../utils/kvMetadata.js';
import notFound from '../utils/notFound.js';
import respond from '../utils/respond.js';

/**
 * Register (deprecated) tutorial routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    // Library tutorials
    app.get('/libraries/:library/tutorials', async ctx => {
        // Get the library
        const lib = await library(ctx.req.param('library'), ctx.sentry).catch(err => {
            if (err.status === 404) return;
            throw err;
        });
        if (!lib) return notFound(ctx, 'Library');

        // Set a 24 hour life on this response
        cache(ctx, 24 * 60 * 60);

        // Tutorials are deprecated, return none
        return respond(ctx, []);
    });

    // Library tutorial
    app.get('/libraries/:library/tutorials/:tutorial', async ctx => {
        // Get the library
        const lib = await library(ctx.req.param('library'), ctx.sentry).catch(err => {
            if (err.status === 404) return;
            throw err;
        });
        if (!lib) return notFound(ctx, 'Library');

        // Tutorials are deprecated, return a 404
        return notFound(ctx, 'Tutorial');
    });
};
