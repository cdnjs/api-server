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
