import { routePath } from 'hono/route';

/**
 * Log an event for Workers Observability, including the route and user agent for context.
 *
 * @param {string} name Name of the event to log.
 * @param {import('hono').Context} ctx Request context.
 * @param {Record<string, *>} [data] Additional data to include in the log.
 */
const event = (name, ctx, data) => {
    const route = routePath(ctx);
    const ua = ctx.req.header('User-Agent') || '';
    console.log(
        `event=${JSON.stringify(name)} route=${JSON.stringify(route)}`,
        { event: { name, route, ua, data } },
    );
};

export default event;
