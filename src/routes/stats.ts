import cache from '../utils/cache.ts';
import filter from '../utils/filter.ts';
import { libraries } from '../utils/kvMetadata.ts';
import { queryCheck } from '../utils/query.ts';
import respond from '../utils/respond.ts';

/**
 * Handle GET /stats requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Promise<Response>}
 */
const handleGetStats = async ctx => {
    const libs = await libraries();
    const response = filter(
        {
            libraries: libs.length,
        },
        queryCheck(ctx.req.queries('fields')),
    );

    // Set a 6 hour life on this response
    cache(ctx, 6 * 60 * 60);

    // Send the response
    return respond(ctx, response);
};

/**
 * Register stats routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    app.get('/stats', handleGetStats);
    app.get('/stats/', handleGetStats);
};
