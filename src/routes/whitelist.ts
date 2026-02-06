import cache from '../utils/cache.js';
import files from '../utils/files.js';
import filter from '../utils/filter.js';
import queryArray from '../utils/queryArray.js';
import respond from '../utils/respond.js';

/**
 * Handle GET /whitelist requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Response}
 */
const handleGetWhitelist = ctx => {
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
