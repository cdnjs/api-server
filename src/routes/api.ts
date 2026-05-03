import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import * as z from 'zod';

import respond, { withCache } from '../utils/respond.ts';

import ApiPage from './api.page.tsx';
import { type OpenApiResponse, openApiResponseSchema } from './api.schema.ts';
import { errorResponseSchema } from './errors.schema.ts';

const createHandleGetApi = (registry: OpenAPIRegistry) => {
    let spec: ReturnType<OpenApiGeneratorV3['generateDocument']>;

    const getOrGenerateSpec = () => {
        if (!spec) {
            const definitions = registry.definitions.slice();

            definitions.forEach((def) => {
                if (def.type === 'route') {
                    def.route.request ??= {};
                    def.route.request.query ??= z.object({});

                    if (!(def.route.request.query instanceof z.ZodObject)) {
                        throw new Error(
                            `Expected query schema for ${def.route.method.toUpperCase()} ${def.route.path} to be a ZodObject`,
                        );
                    }

                    // Inject the human output query parameter that all routes support
                    def.route.request.query = def.route.request.query.extend({
                        output: z.string().optional().openapi({
                            description:
                                'Use the output value human to receive the JSON results in pretty print format, presented on a HTML page.',
                        }),
                    });

                    // Inject the standard 500 response that all routes could return
                    def.route.responses[500] = {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: errorResponseSchema,
                            },
                        },
                    };
                }
            });

            definitions.sort((a, b) => {
                if (a.type === 'route' && b.type === 'route') {
                    // Hoist routes with the libraries tag, as they are the core of cdnjs
                    const aHasLibrariesTag =
                        a.route.tags?.includes('libraries');
                    const bHasLibrariesTag =
                        b.route.tags?.includes('libraries');
                    if (aHasLibrariesTag !== bHasLibrariesTag) {
                        return aHasLibrariesTag ? -1 : 1;
                    }

                    // Otherwise, sort by method first
                    const methodOrder = [
                        'get',
                        'post',
                        'patch',
                        'put',
                        'delete',
                    ];
                    const methodComparison =
                        methodOrder.indexOf(a.route.method) -
                        methodOrder.indexOf(b.route.method);
                    if (methodComparison !== 0) {
                        return methodComparison;
                    }

                    // Then, sort by how deep the route is
                    const aDepth = a.route.path.split('/').length;
                    const bDepth = b.route.path.split('/').length;
                    if (aDepth !== bDepth) {
                        return aDepth - bDepth;
                    }

                    // Finally, sort alphabetically
                    return a.route.path.localeCompare(b.route.path);
                }

                return 0;
            });

            spec = new OpenApiGeneratorV3(definitions).generateDocument({
                openapi: '3.0.0',
                info: {
                    title: 'cdnjs API',
                    description:
                        'The cdnjs API allows for easy programmatic navigation of our libraries.',
                    version: '1.0.0',
                },
                servers: [
                    { url: 'https://api.cdnjs.com', description: 'Production' },
                ],
            });

            // Clean up the empty parameters components object, as the OpenAPI linter doesn't like it
            if (
                spec.components?.parameters &&
                Object.keys(spec.components.parameters).length === 0
            ) {
                delete spec.components.parameters;
            }

            // Sort the schemas in the components object alphabetically, for easier navigation by humans
            if (spec.components?.schemas) {
                spec.components.schemas = Object.fromEntries(
                    Object.entries(spec.components.schemas).sort(([a], [b]) =>
                        a.localeCompare(b),
                    ),
                );
            }
        }

        return spec;
    };

    /**
     * Handle GET /api requests.
     *
     * @param ctx Request context.
     */
    const handleGetApi = (ctx: Context) => {
        // Set a 6 hour life on this response
        withCache(ctx, 6 * 60 * 60);

        return respond<OpenApiResponse>(ctx, getOrGenerateSpec(), ApiPage);
    };

    return handleGetApi;
};

/**
 * Register api route.
 *
 * @param app App instance.
 * @param registry OpenAPI registry instance.
 */
export default (app: Hono, registry: OpenAPIRegistry) => {
    app.get('/api', createHandleGetApi(registry));
    app.get('/api/', createHandleGetApi(registry));

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
