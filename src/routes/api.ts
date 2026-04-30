import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import { z } from 'zod';

import respond, { withCache } from '../utils/respond.ts';

import { openApiResponseSchema } from './api.schema.ts';
import type { OpenApiResponse } from './api.schema.ts';
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

const errorResponseRef = {
    $ref: '#/components/schemas/Error',
} as const;

const errorResponseContent = {
    'application/json': {
        schema: errorResponseRef,
    },
} as const;

const humanOutputQuery = {
    output: z.string().optional().openapi({
        description:
            'Use the output value human to receive the JSON results in pretty print format, presented on a HTML page.',
    }),
};

registry.registerPath({
    method: 'get',
    path: '/api',
    summary: 'Get OpenAPI Specification',
    description: 'Returns the OpenAPI specification for the cdnjs API.',
    tags: ['meta'],
    request: {
        query: z.object({
            ...humanOutputQuery,
        }),
    },
    responses: {
        200: {
            description: 'OpenAPI JSON Specification',
            content: {
                'application/json': {
                    schema: openApiResponseSchema,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: errorResponseContent,
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/libraries',
    summary: 'Browsing all libraries on cdnjs',
    description:
        'The `/libraries` endpoint will return a JSON object with three top-level properties.\n\nThis API endpoint can also be used to search cdnjs for libraries, by making use of the optional `search` URL query parameter.\n\nThe cache lifetime on this endpoint is six hours.',
    tags: ['libraries'],
    request: {
        query: z.object({
            search: z.string().optional().openapi({
                description:
                    "The value to use when searching the libraries index on cdnjs.\n\nLibraries will not be ranked by search relevance when they are returned, they will be ranked using the same ranking as when no search query is provided.\n\n*This ranking is done by Algolia and is primarily based on the number of stars each library's associated GitHub repo has.*",
            }),
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return in each library object from the cdnjs Algolia index. name and latest will always be present in every object. Any field requested that does not exist will be included in each object with a null value. Currently, the following fields (case-sensitive) are published in the Algolia index for each library and can be requested via this parameter: filename, description, version, keywords, alternativeNames, fileType, github, objectID, license, homepage, repository, author, originalName, sri. The available fields are based on the SearchEntry structure in our tools repo.',
            }),
            search_fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to be considered when searching for a given search query parameter. Not all fields are supported for this, any unsupported fields given will be silently ignored. Currently, the following fields (case-sensitive) are supported: name, alternativeNames, github.repo, description, keywords, filename, repositories.url, github.user, maintainers.name. The supported fields are controlled by our Algolia settings and are mirrored in the API server libraries route logic.',
            }),
            limit: z.number().optional().openapi({
                description:
                    'Limit the number of library objects that are returned in the results array. This value will be reflected in the total top-level property, but the available property will return the full number with no limit applied.',
            }),
            ...humanOutputQuery,
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
        500: {
            description: 'Internal server error',
            content: errorResponseContent,
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/libraries/{library}',
    summary: 'Getting a specific library on cdnjs',
    description:
        'Accessing `assets` for all versions of a library using this endpoint is deprecated. The `assets` property now only contains a single entry for the latest version. To access the assets of any version, use the `/libraries/:library/:version` endpoint.\n\nSee [cdnjs/cdnjs issue #14140](https://github.com/cdnjs/cdnjs/issues/14140) for more information.\n\nThe `/libraries/:library` endpoint allows for data on a specific library to be requested and will return a JSON object with all library data properties by default.\n\nThe cache lifetime on this endpoint is six hours.',
    tags: ['libraries'],
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
            ...humanOutputQuery,
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
                    schema: errorResponseRef,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: errorResponseContent,
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/libraries/{library}/{version}',
    summary: 'Getting a specific version for a library on cdnjs',
    description:
        'The `/libraries/:library/:version` endpoint returns a JSON object with details specific to a requested version of a library on cdnjs.\n\nThe cache lifetime on this endpoint is 355 days, identical to the CDN. The response is also marked as immutable, as a version on cdnjs will never change once published.\n\ncdnjs only allows access to specific versions of a library, and these are considered immutable. Access to tags for a library, such as `latest`, is not supported as these have a mutable definition, which would go against what cdnjs aims to provide with long-life caching on responses and SRI hashes.',
    tags: ['libraries'],
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
            ...humanOutputQuery,
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
                    schema: errorResponseRef,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: errorResponseContent,
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/whitelist',
    summary: 'Fetch details about the cdnjs file extension whitelist',
    description:
        'The `/whitelist` endpoint returns a JSON object containing a list of extensions permitted on the CDN as well as categories for those extensions.\n\nThe cache lifetime on this endpoint is 6 hours.',
    tags: ['meta'],
    request: {
        query: z.object({
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return from the available whitelist data.',
            }),
            ...humanOutputQuery,
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
        500: {
            description: 'Internal server error',
            content: errorResponseContent,
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/stats',
    summary: 'Fetch basic statistics for cdnjs',
    description:
        'The `/stats` endpoint returns a JSON object containing a set of statistics relating to cdnjs.\n\nThe cache lifetime on this endpoint is 6 hours.',
    tags: ['meta'],
    request: {
        query: z.object({
            fields: z.string().optional().openapi({
                description:
                    'Provide a comma-separated string of fields to return in the stats object.',
            }),
            ...humanOutputQuery,
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
        500: {
            description: 'Internal server error',
            content: errorResponseContent,
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
 */
export default (app: Hono) => {
    app.get('/api', handleGetApi);
    app.get('/api/', handleGetApi);
};
