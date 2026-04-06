import type { Context, Hono } from 'hono';

import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import { queryCheck } from '../utils/query.ts';
import respond, { withCache } from '../utils/respond.ts';

import type { WhitelistResponse } from './whitelist.schema.ts';

/**
 * Handle GET /whitelist requests.
 *
 * @param ctx Request context.
 */
const handleGetWhitelist = (ctx: Context) => {
    // Generate the filtered response
    const response: WhitelistResponse = filter(
        {
            extensions: Object.keys(files),
            categories: files,
        },
        queryCheck(ctx.req.queries('fields')),
    );

    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

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
