import type { Context, Hono } from 'hono';

import type { WhitelistResponse } from './whitelist.schema.ts';
import cache from '../utils/cache.ts';
import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import queryArray from '../utils/queryArray.ts';
import respond from '../utils/respond.ts';

/**
 * Handle GET /whitelist requests.
 *
 * @param ctx Request context.
 */
const handleGetWhitelist = (ctx: Context) => {
    // Build the object
    const results = {
        extensions: Object.keys(files),
        categories: files,
    };

    // Generate the filtered response
    const requestedFields = queryArray(ctx.req.queries('fields'));
    const response = filter(
        results,
        requestedFields,
        // If they requested no fields or '*', send them all
        !requestedFields.length || requestedFields.includes('*'),
    );

    // Set a 6 hour life on this response
    cache(ctx, 6 * 60 * 60);

    // Send the response
    return respond(ctx, response satisfies WhitelistResponse);
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
