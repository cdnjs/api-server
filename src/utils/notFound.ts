import type { Context } from 'hono';
import cache from './cache.ts';
import respond from './respond.ts';

/**
 * Respond to a request where a resource wasn't found.
 *
 * @param ctx Request context.
 * @param resource Resource that was not found.
 */
export default (ctx: Context, resource: string) => {
    // Set a 1 hour on this response
    cache(ctx, 60 * 60);

    // Send the error response
    ctx.status(404);
    return respond(ctx, {
        error: true,
        status: 404,
        message: `${resource} not found`,
    });
};
