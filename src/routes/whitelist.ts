import cache from '../utils/cache.ts';
import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import { queryCheck } from '../utils/query.ts';
import respond from '../utils/respond.ts';

/**
 * Handle GET /whitelist requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Response}
 */
const handleGetWhitelist = ctx => {
    // Generate the filtered response
    const response = filter(
        {
            extensions: Object.keys(files),
            categories: files,
        },
        queryCheck(ctx.req.queries('fields')),
    );

    // Set a 6 hour life on this response
    cache(ctx, 6 * 60 * 60);

    // Send the response
    return respond(ctx, response);
};

/**
 * Register whitelist routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    // Whitelist
    app.get('/whitelist', handleGetWhitelist);
    app.get('/whitelist/', handleGetWhitelist);
};
