import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';

import respond, { withCache } from '../utils/respond.ts';

import { type OpenApiResponse, openApiResponseSchema } from './api.schema.ts';

const registry = new OpenAPIRegistry();

const generator = new OpenApiGeneratorV3(registry.definitions);

const openApiSpec = generator.generateDocument({
    openapi: '3.0.0',
    info: {
        title: 'cdnjs API',
        description:
            'The cdnjs API allows for easy programmatic navigation of our libraries.',
        version: '1.0.0',
    },
    servers: [{ url: 'https://api.cdnjs.com', description: 'Production' }],
});

if (
    openApiSpec.components?.parameters &&
    Object.keys(openApiSpec.components.parameters).length === 0
) {
    delete openApiSpec.components.parameters;
}

/**
 * Handle GET /api requests.
 *
 * @param ctx Request context.
 */
const handleGetApi = (ctx: Context) => {
    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

    return respond<OpenApiResponse>(ctx, openApiSpec);
};

/**
 * Register api route.
 *
 * @param app App instance.
 * @param registry OpenAPI registry instance.
 */
export default (app: Hono, registry: OpenAPIRegistry) => {
    app.get('/api', handleGetApi);
    app.get('/api/', handleGetApi);

    registry.registerPath({
        method: 'get',
        path: '/api',
        summary: 'Get OpenAPI Specification',
        description: 'Returns the OpenAPI specification for the cdnjs API.',
        tags: ['meta'],
        responses: {
            200: {
                description: 'OpenAPI JSON Specification',
                content: {
                    'application/json': {
                        schema: openApiResponseSchema,
                    },
                },
            },
        },
    });
};
