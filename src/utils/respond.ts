import type { Context } from 'hono';

import type { ErrorResponse } from '../routes/errors.schema.ts';

import cache from './cache.ts';
import event from './event.ts';
import Json from './jsx/json.tsx';

/**
 * Generate an HTML response with pretty-printed data.
 *
 * @param ctx Request context.
 * @param data Data to be included in the response.
 */
const human = (ctx: Context, data: unknown) => {
    event('human-output', ctx);

    ctx.header('X-Robots-Tag', 'noindex');
    return ctx.render(Json({ json: data }));
};

/**
 * Respond to a request with data, handling if it should be returned as JSON or pretty-printed in HTML.
 *
 * @param ctx Request context.
 * @param data Data to be included in the response.
 */
const respond = (ctx: Context, data: unknown) =>
    ctx.req.query('output') === 'human' ? human(ctx, data) : ctx.json(data);

export default respond;

/**
 * Respond to a request where a resource wasn't found.
 *
 * @param ctx Request context.
 * @param resource Resource that was not found.
 */
export const notFound = (ctx: Context, resource: string) => {
    // Set a 1 hour on this response
    cache(ctx, 60 * 60);

    // Send the error response
    ctx.status(404);
    return respond(ctx, {
        error: true,
        status: 404,
        message: `${resource} not found`,
    } satisfies ErrorResponse);
};
