import type { Context } from 'hono';

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
export default (ctx: Context, data: unknown) =>
    ctx.req.query('output') === 'human' ? human(ctx, data) : ctx.json(data);
