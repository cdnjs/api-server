import type { Context, Hono } from 'hono';

import cache from '../utils/cache.ts';
import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import { queryCheck } from '../utils/query.ts';
import respond from '../utils/respond.ts';

/**
 * Handle GET /whitelist requests.
 *
 * @param ctx Request context.
 */
const handleGetWhitelist = (ctx: Context) => {
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
 * @param app App instance.
 */
export default (app: Hono) => {
    // Whitelist
    app.get('/whitelist', handleGetWhitelist);
    app.get('/whitelist/', handleGetWhitelist);
};
