import type { Context } from 'hono';
import { routePath } from 'hono/route';

/**
 * Log an event for Workers Observability, including the route and user agent for context.
 *
 * @param name Name of the event to log.
 * @param opts Options for the event.
 * @param opts.ctx Request context for the event.
 * @param opts.level Log level for the event.
 * @param opts.data Additional data for the event.
 */
const event = (
    name: string,
    {
        ctx,
        level = 'log',
        data = {},
    }: {
        ctx?: Context;
        level?: 'log' | 'debug' | 'info' | 'warn' | 'error';
        data?: Record<string, unknown>;
    } = {},
) => {
    const route = ctx ? routePath(ctx) : 'unknown';
    const ua = (ctx && ctx.req.header('User-Agent')) || 'unknown';
    console[level](
        `event=${JSON.stringify(name)} route=${JSON.stringify(route)}`,
        { event: { name, route, ua, level, data } },
    );
};

export default event;
