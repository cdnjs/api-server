import type { Context, Hono } from 'hono';

import respond, { withCache } from '../utils/respond.ts';

const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'cdnjs API',
        description:
            'The cdnjs API allows for easy programmatic navigation of our libraries.',
        version: '1.0.0',
    },
    servers: [{ url: 'https://api.cdnjs.com', description: 'Production' }],
    paths: {
        '/api': {
            get: {
                summary: 'Get OpenAPI Specification',
                description:
                    'Returns the OpenAPI specification for the cdnjs API.',
                responses: {
                    '200': {
                        description: 'OpenAPI JSON Specification',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/libraries': {
            get: {
                summary: 'Browsing all libraries on cdnjs',
                description:
                    'The /libraries endpoint will return a JSON object with three top-level properties. This API endpoint can also be used to search cdnjs for libraries, by making use of the optional search URL query parameter.',
                parameters: [
                    {
                        name: 'search',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'The value to use when searching the libraries index on cdnjs.',
                    },
                    {
                        name: 'fields',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'Provide a comma-separated string of fields to return in each library object from the cdnjs Algolia index. name and latest will always be present.',
                    },
                    {
                        name: 'search_fields',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'Provide a comma-separated string of fields to be considered when searching for a given search query parameter.',
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer' },
                        description:
                            'Limit the number of library objects that are returned in the results array.',
                    },
                ],
                responses: {
                    '200': {
                        description: 'A list of libraries',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        results: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { type: 'string' },
                                                    latest: {
                                                        type: 'string',
                                                        nullable: true,
                                                    },
                                                    alternativeNames: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    originalName: {
                                                        type: 'string',
                                                    },
                                                    version: { type: 'string' },
                                                    description: {
                                                        type: 'string',
                                                    },
                                                    keywords: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    license: { type: 'string' },
                                                    homepage: {
                                                        type: 'string',
                                                    },
                                                    author: { type: 'string' },
                                                    filename: {
                                                        type: 'string',
                                                    },
                                                    sri: { type: 'string' },
                                                    fileType: {
                                                        type: 'string',
                                                    },
                                                    github: {
                                                        type: 'object',
                                                        nullable: true,
                                                        properties: {
                                                            repo: {
                                                                type: 'string',
                                                            },
                                                            user: {
                                                                type: 'string',
                                                            },
                                                            stargazers_count: {
                                                                type: 'number',
                                                            },
                                                            forks: {
                                                                type: 'number',
                                                            },
                                                            subscribers_count: {
                                                                type: 'number',
                                                            },
                                                        },
                                                    },
                                                    repository: {
                                                        type: 'object',
                                                        nullable: true,
                                                        properties: {
                                                            type: {
                                                                type: 'string',
                                                            },
                                                            url: {
                                                                type: 'string',
                                                            },
                                                        },
                                                    },
                                                    objectID: {
                                                        type: 'string',
                                                    },
                                                },
                                                required: ['name'],
                                            },
                                        },
                                        total: { type: 'number' },
                                        available: { type: 'number' },
                                    },
                                    required: ['results', 'total', 'available'],
                                },
                            },
                        },
                    },
                },
            },
        },
        '/libraries/{library}': {
            get: {
                summary: 'Getting a specific library on cdnjs',
                description:
                    'Returns data about a specific library on cdnjs. Accessing assets for all versions of a library using this endpoint is deprecated. The assets property now only contains a single entry for the latest version. To access the assets of any version, use the /libraries/:library/:version endpoint.',
                parameters: [
                    {
                        name: 'library',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'The name of the library.',
                    },
                    {
                        name: 'fields',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'Provide a comma-separated string of fields to return in the library object.',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Library details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        keywords: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                        version: { type: 'string' },
                                        filename: { type: 'string' },
                                        homepage: { type: 'string' },
                                        license: { type: 'string' },
                                        author: { type: 'string' },
                                        repository: {
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string' },
                                                url: { type: 'string' },
                                            },
                                        },
                                        autoupdate: {
                                            oneOf: [
                                                {
                                                    type: 'object',
                                                    properties: {
                                                        type: {
                                                            type: 'string',
                                                        },
                                                        target: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    required: [
                                                        'type',
                                                        'target',
                                                    ],
                                                },
                                                {
                                                    type: 'object',
                                                    properties: {
                                                        source: {
                                                            type: 'string',
                                                        },
                                                        target: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    required: [
                                                        'source',
                                                        'target',
                                                    ],
                                                },
                                            ],
                                        },
                                        latest: {
                                            type: 'string',
                                            nullable: true,
                                        },
                                        sri: { type: 'string', nullable: true },
                                        versions: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                        assets: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    version: { type: 'string' },
                                                    files: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    rawFiles: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    sri: {
                                                        type: 'object',
                                                        additionalProperties: {
                                                            type: 'string',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Library not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/libraries/{library}/{version}': {
            get: {
                summary: 'Getting a specific version for a library on cdnjs',
                description:
                    'Returns data about a specific version of a library on cdnjs.',
                parameters: [
                    {
                        name: 'library',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'The name of the library.',
                    },
                    {
                        name: 'version',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'The version of the library.',
                    },
                    {
                        name: 'fields',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'Provide a comma-separated string of fields to return.',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Library version details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        version: { type: 'string' },
                                        files: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                        rawFiles: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                        sri: {
                                            type: 'object',
                                            additionalProperties: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Library or version not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/whitelist': {
            get: {
                summary:
                    'Fetch details about the cdnjs file extension whitelist',
                description:
                    'Returns the file extension whitelist that cdnjs uses.',
                responses: {
                    '200': {
                        description: 'Whitelist details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        extensions: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                        categories: {
                                            type: 'object',
                                            additionalProperties: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/stats': {
            get: {
                summary: 'Fetch basic statistics for cdnjs',
                description: 'Returns basic statistics about cdnjs.',
                parameters: [
                    {
                        name: 'fields',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'Provide a comma-separated string of fields to return in the stats object.',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Statistics',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        libraries: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'boolean', enum: [true] },
                    status: { type: 'number' },
                    message: { type: 'string' },
                    ref: { type: 'string' },
                },
                required: ['error', 'status', 'message'],
            },
        },
    },
};

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
