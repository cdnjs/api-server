import type { Context, Hono } from 'hono';

import type { StatsResponse } from './stats.schema.ts';
import cache from '../utils/cache.ts';
import filter from '../utils/filter.ts';
import { libraries } from '../utils/kvMetadata.ts';
import queryArray from '../utils/queryArray.ts';
import respond from '../utils/respond.ts';

/**
 * Handle GET /stats requests.
 *
 * @param ctx Request context.
 */
const handleGetStats = async (ctx: Context) => {
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
    return respond(ctx, response satisfies StatsResponse);
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
