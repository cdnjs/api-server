import type { Context, Hono } from 'hono';

import cache from '../utils/cache.ts';
import filter from '../utils/filter.ts';
import { libraries } from '../utils/kvMetadata.ts';
import { queryCheck } from '../utils/query.ts';
import respond from '../utils/respond.ts';

import type { StatsResponse } from './stats.schema.ts';

/**
 * Handle GET /stats requests.
 *
 * @param ctx Request context.
 */
const handleGetStats = async (ctx: Context) => {
    const libs = await libraries();
    const response: StatsResponse = filter(
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
 * @param app App instance.
 */
export default (app: Hono) => {
    app.get('/stats', handleGetStats);
    app.get('/stats/', handleGetStats);
};
