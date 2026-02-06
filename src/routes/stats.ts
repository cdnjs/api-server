import cache from '../utils/cache.js';
import filter from '../utils/filter.js';
import { libraries } from '../utils/kvMetadata.js';
import queryArray from '../utils/queryArray.js';
import respond from '../utils/respond.js';

/**
 * Handle GET /stats requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Promise<Response>}
 */
const handleGetStats = async ctx => {
    const libs = await libraries();
    const requestedFields = queryArray(ctx.req.queries('fields'));
    const response = filter(
        {
            libraries: libs.length,
        },
        requestedFields,
        // If they requested no fields or '*', send them all
        !requestedFields.length || requestedFields.includes('*'),
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
