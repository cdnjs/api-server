import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import * as z from 'zod';

import filter from '../utils/filter.ts';
import { libraries } from '../utils/metadata.ts';
import { queryCheck } from '../utils/query.ts';
import respond, { withCache } from '../utils/respond.ts';

import { type StatsResponse, statsResponseSchema } from './stats.schema.ts';

/**
 * Handle GET /stats requests.
 *
 * @param ctx Request context.
 */
const handleGetStats = async (ctx: Context) => {
    const libs = await libraries();
    const response: StatsResponse = filter(
        {
            libraries: libs.length,
        },
        queryCheck(ctx.req.queries('fields')),
    );

    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

    // Send the response
    return respond<StatsResponse>(ctx, response);
};

/**
 * Register stats routes.
 *
 * @param app App instance.
 * @param registry OpenAPI registry instance.
 */
export default (app: Hono, registry: OpenAPIRegistry) => {
    app.get('/stats', handleGetStats);
    app.get('/stats/', handleGetStats);

    registry.registerPath({
        method: 'get',
        path: '/stats',
        summary: 'Fetch basic statistics for cdnjs',
        description: [
            'The `/stats` endpoint returns a JSON object containing a set of statistics relating to cdnjs.',
            '',
            'The cache lifetime on this endpoint is 6 hours.',
        ].join('\n'),
        tags: ['meta'],
        request: {
            query: z.object({
                fields: z.string().optional().openapi({
                    description:
                        'Provide a comma-separated string of fields to return in the stats object. If no field are specified, all fields will be returned.',
                }),
            }),
        },
        responses: {
            200: {
                description: 'Statistics',
                content: {
                    'application/json': {
                        schema: statsResponseSchema,
                    },
                },
            },
        },
    });
};
