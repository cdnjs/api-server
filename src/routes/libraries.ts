import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import * as z from 'zod';

import { libraries } from '../utils/algolia.ts';
import filter from '../utils/filter.ts';
import { queryArray, queryCheck } from '../utils/query.ts';
import respond, { withCache } from '../utils/respond.ts';

import {
    type LibrariesResponse,
    librariesResponseSchema,
} from './libraries.schema.ts';

/**
 * Handle GET /libraries requests.
 *
 * @param ctx Request context.
 */
const handleGetLibraries = async (ctx: Context) => {
    // Get the index results
    const searchFields = queryArray(ctx.req.queries('search_fields'));
    const results = await libraries(
        ctx.req.query('search') || '',
        searchFields.includes('*') ? [] : searchFields,
    );

    // Transform the results into our filtered array
    const requestedFields = queryCheck(ctx.req.queries('fields'), false);
    const response = results.map((hit) => ({
        // Always send back name & latest
        name: hit.name,
        latest:
            hit.filename && hit.version
                ? 'https://cdnjs.cloudflare.com/ajax/libs/' +
                  hit.name +
                  '/' +
                  hit.version +
                  '/' +
                  hit.filename
                : null,
        // Send back whatever else was requested, only send all if '*' explicitly included
        ...filter(hit, requestedFields),
    }));

    // If they want less data, allow that
    const limit = ctx.req.query('limit') && Number(ctx.req.query('limit'));
    const trimmed = limit ? response.slice(0, limit) : response;

    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

    // Send the response
    return respond<LibrariesResponse>(ctx, {
        results: trimmed,
        total: trimmed.length, // Total results we're sending back
        available: response.length, // Total number available without trimming
    });
};

/**
 * Register libraries routes.
 *
 * @param app App instance.
 * @param registry OpenAPI registry instance.
 */
export default (app: Hono, registry: OpenAPIRegistry) => {
    app.get('/libraries', handleGetLibraries);
    app.get('/libraries/', handleGetLibraries);

    registry.registerPath({
        method: 'get',
        path: '/libraries',
        summary: 'Browsing all libraries on cdnjs',
        description: [
            'The `/libraries` endpoint will return a JSON object with key information on all available libraries on cdnjs.',
            '',
            'This API endpoint can also be used to search cdnjs for specific libraries, by making use of the optional `search` URL query parameter.',
            '',
            'The cache lifetime on this endpoint is six hours.',
        ].join('\n'),
        tags: ['libraries'],
        request: {
            query: z.object({
                search: z
                    .string()
                    .optional()
                    .openapi({
                        description: [
                            'The value to use when searching the libraries index on cdnjs.',
                            '',
                            'Libraries will not be ranked by search relevance when they are returned, they will be ranked using the same ranking as when no search query is provided.',
                            '',
                            "*This ranking is done by Algolia and is primarily based on the number of stars each library's associated GitHub repo has.*",
                        ].join('\n'),
                    }),
                fields: z
                    .string()
                    .optional()
                    .openapi({
                        description: [
                            'Provide a comma-separated string of fields to return in each library object from the cdnjs Algolia index.',
                            '',
                            'The following fields (case-sensitive) are published in the Algolia index for each library and can be requested via this parameter: `filename`, `description`, `version`, `keywords`, `alternativeNames`, `fileType`, `github`, `objectID`, `license`, `homepage`, `repository`, `author`, `originalName`, `sri`.',
                            '',
                            'The `name` and `latest` fields are always returned for each result. If no field are specified, only these fields will be returned. `*` can be provided to return all available fields.',
                            '',
                            '*The available fields are based on the [SearchEntry structure in our tools repo](https://github.com/cdnjs/tools/blob/master/cmd/algolia/main.go).*',
                        ].join('\n'),
                    }),
                search_fields: z
                    .string()
                    .optional()
                    .openapi({
                        description: [
                            'Provide a comma-separated string of fields to be considered when searching for a given search query parameter.',
                            '',
                            'The following fields (case-sensitive) are supported for searching: `name`, `alternativeNames`, `github.repo`, `description`, `keywords`, `filename`, `repositories.url`, `github.user`, `maintainers.name`. Any unsupported fields provided will be silently ignored.',
                            '',
                            '*The supported fields are controlled by our Algolia settings and are mirrored in the [API server Algolia libraries logic](https://github.com/cdnjs/api-server/blob/master/src/utils/algolia.ts).*',
                        ].join('\n'),
                    }),
                limit: z.number().optional().openapi({
                    description:
                        'Limit the number of library objects that are returned in the results array. This value will be reflected in the total top-level property, but the available property will return the full number with no limit applied.',
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
};
