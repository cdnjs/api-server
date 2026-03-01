import type { Context } from 'hono';
import { routePath } from 'hono/route';

/**
 * Log an event for Workers Observability, including the route and user agent for context.
 *
 * @param name Name of the event to log.
 * @param ctx Request context.
 * @param data Additional data to include in the log.
 */
const event = (name: string, ctx: Context, data: Record<string, unknown> = {}) => {
    const route = routePath(ctx);
    const ua = ctx.req.header('User-Agent') || '';
    console.log(
        `event=${JSON.stringify(name)} route=${JSON.stringify(route)}`,
        { event: { name, route, ua, data } },
    );
};

export default event;
