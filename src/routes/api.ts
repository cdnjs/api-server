import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import { z } from 'zod';

import respond, { withCache } from '../utils/respond.ts';

import { errorResponseSchema } from './errors.schema.ts';
import { librariesResponseSchema } from './libraries.schema.ts';
import {
    libraryResponseSchema,
    libraryVersionResponseSchema,
} from './library.schema.ts';
import { statsResponseSchema } from './stats.schema.ts';
import { whitelistResponseSchema } from './whitelist.schema.ts';

const registry = new OpenAPIRegistry();

// Register the Error schema as a component
registry.register('Error', errorResponseSchema);

registry.registerPath({
    method: 'get',
    path: '/api',
    summary: 'Get OpenAPI Specification',
    description: 'Returns the OpenAPI specification for the cdnjs API.',
    responses: {
        200: {
            description: 'OpenAPI JSON Specification',
            content: {
                'application/json': {
                    schema: z.object({}),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/libraries',
    summary: 'Browsing all libraries on cdnjs',
    description:
        'The /libraries endpoint will return a JSON object with three top-level properties. This API endpoint can also be used to search cdnjs for libraries, by making use of the optional search URL query parameter.',
    request: {
        query: z.object({
            search: z.string().optional().openapi({
                description:
                    'The value to use when searching the libraries index on cdnjs.',
            }),
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return in each library object from the cdnjs Algolia index. name and latest will always be present.',
            }),
            search_fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to be considered when searching for a given search query parameter.',
            }),
            limit: z.number().optional().openapi({
                description:
                    'Limit the number of library objects that are returned in the results array.',
            }),
        }),
    },
    responses: {
        200: {
            description: 'A list of libraries',
            content: {
                'application/json': {
                    schema: librariesResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/libraries/{library}',
    summary: 'Getting a specific library on cdnjs',
    description:
        'Returns data about a specific library on cdnjs. Accessing assets for all versions of a library using this endpoint is deprecated. The assets property now only contains a single entry for the latest version. To access the assets of any version, use the /libraries/:library/:version endpoint.',
    request: {
        params: z.object({
            library: z
                .string()
                .openapi({ description: 'The name of the library.' }),
        }),
        query: z.object({
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return in the library object.',
            }),
        }),
    },
    responses: {
        200: {
            description: 'Library details',
            content: {
                'application/json': {
                    schema: libraryResponseSchema,
                },
            },
        },
        404: {
            description: 'Library not found',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/libraries/{library}/{version}',
    summary: 'Getting a specific version for a library on cdnjs',
    description: 'Returns data about a specific version of a library on cdnjs.',
    request: {
        params: z.object({
            library: z
                .string()
                .openapi({ description: 'The name of the library.' }),
            version: z
                .string()
                .openapi({ description: 'The version of the library.' }),
        }),
        query: z.object({
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return.',
            }),
        }),
    },
    responses: {
        200: {
            description: 'Library version details',
            content: {
                'application/json': {
                    schema: libraryVersionResponseSchema,
                },
            },
        },
        404: {
            description: 'Library or version not found',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/whitelist',
    summary: 'Fetch details about the cdnjs file extension whitelist',
    description: 'Returns the file extension whitelist that cdnjs uses.',
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

registry.registerPath({
    method: 'get',
    path: '/stats',
    summary: 'Fetch basic statistics for cdnjs',
    description: 'Returns basic statistics about cdnjs.',
    request: {
        query: z.object({
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return in the stats object.',
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

/**
 * Handle GET /api requests.
 *
 * @param ctx Request context.
 */
const handleGetApi = (ctx: Context) => {
    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

    return respond(ctx, openApiSpec);
};

/**
 * Register api route.
 *
 * @param app App instance.
 */
export default (app: Hono) => {
    app.get('/api', handleGetApi);
    app.get('/api/', handleGetApi);
};
