import type { Context, Hono } from 'hono';

import { libraries } from '../utils/algolia.ts';
import cache from '../utils/cache.ts';
import filter from '../utils/filter.ts';
import { queryArray, queryCheck } from '../utils/query.ts';
import respond from '../utils/respond.ts';

/**
 * Handle GET /libraries requests.
 *
 * @param ctx Request context.
 */
const handleGetLibraries = async (ctx: Context) => {
    // Get the index results
    const searchFields = queryArray(ctx.req.queries('search_fields'));
    const results = await libraries(
        ctx.req.query('search') || '',
        searchFields.includes('*') ? [] : searchFields,
    );

    // Transform the results into our filtered array
    const requestedFields = queryCheck(ctx.req.queries('fields'), false);
    const response = results.map(hit => ({
        // Always send back name & latest
        name: hit.name,
        latest: hit.filename && hit.version ? 'https://cdnjs.cloudflare.com/ajax/libs/' + hit.name + '/' + hit.version + '/' + hit.filename : null,
        // Send back whatever else was requested, only send all if '*' explicitly included
        ...filter(hit, requestedFields),
    }));

    // If they want less data, allow that
    const limit = ctx.req.query('limit') && Number(ctx.req.query('limit'));
    const trimmed = limit ? response.slice(0, limit) : response;

    // Set a 6 hour life on this response
    cache(ctx, 6 * 60 * 60);

    // Send the response
    return respond(ctx, {
        results: trimmed,
        total: trimmed.length, // Total results we're sending back
        available: response.length, // Total number available without trimming
    });
};

/**
 * Register libraries routes.
 *
 * @param app App instance.
 */
export default (app: Hono) => {
    app.get('/libraries', handleGetLibraries);
    app.get('/libraries/', handleGetLibraries);
};
