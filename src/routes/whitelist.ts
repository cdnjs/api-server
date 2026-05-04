import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import * as z from 'zod';

import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import { queryCheck } from '../utils/query.ts';
import respond, { withCache } from '../utils/respond.ts';

import {
    type WhitelistResponse,
    whitelistResponseSchema,
} from './whitelist.schema.ts';

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
    return respond<WhitelistResponse>(ctx, response);
};

/**
 * Register whitelist routes.
 *
 * @param app App instance.
 * @param registry OpenAPI registry instance.
 */
export default (app: Hono, registry: OpenAPIRegistry) => {
    // Whitelist
    app.get('/whitelist', handleGetWhitelist);
    app.get('/whitelist/', handleGetWhitelist);

    registry.registerPath({
        method: 'get',
        path: '/whitelist',
        summary: 'Fetch details about the cdnjs file extension whitelist',
        description: [
            'The `/whitelist` endpoint returns a JSON object containing a list of extensions permitted on the CDN as well as categories for those extensions.',
            '',
            'The cache lifetime on this endpoint is 6 hours.',
        ].join('\n'),
        tags: ['meta'],
        request: {
            query: z.object({
                fields: z.string().optional().openapi({
                    description:
                        'Provide a comma-separated string of fields to return from the available whitelist data. If no field are specified, all fields will be returned.',
                }),
            }),
        },
        responses: {
            200: {
                description: 'Whitelist details',
                content: {
                    'application/json': {
                        schema: whitelistResponseSchema,
                    },
                },
            },
        },
    });
};
