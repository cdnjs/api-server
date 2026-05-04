import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';
import * as z from 'zod';

import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import {
    library,
    libraryVersion,
    libraryVersionSri,
    libraryVersions,
} from '../utils/metadata.ts';
import { queryCheck } from '../utils/query.ts';
import respond, { notFound, withCache } from '../utils/respond.ts';

import { errorResponseSchema } from './errors.schema.ts';
import {
    type LibraryResponse,
    type LibraryVersionResponse,
    libraryResponseSchema,
    libraryVersionResponseSchema,
} from './library.schema.ts';

/**
 * Create a map of file names to SRI hashes, based on library files and SRI data.
 *
 * @param library Name of the library.
 * @param version Version of the library.
 * @param files Names of the files for this version of the library.
 * @param sriData SRI data for the library version.
 */
const sriForVersion = (
    library: string,
    version: string,
    files: string[],
    sriData: Record<string, string>,
) => {
    // Build the SRI object
    const sri: Record<string, string> = {};
    for (const file of files) {
        const fullFile = `${library}/${version}/${file}`;

        // If we have an SRI entry for this, add it
        if (sriData && sriData[fullFile]) {
            sri[file] = sriData[fullFile];
            continue;
        }

        // If we don't have an SRI entry, but expect one, error!
        // if (file.endsWith('.js') || file.endsWith('.css')) {
        //     Sentry.withScope(scope => {
        //         scope.setTag('library', library);
        //         scope.setTag('library.version', version);
        //         scope.setTag('library.file', file);
        //         scope.setTag('library.file.full', fullFile);
        //         Sentry.captureException(new Error('Missing SRI entry'));
        //     });
        // }
    }

    // Done
    return sri;
};

/**
 * Check if a file is whitelisted for cdnjs, based on its extension.
 *
 * @param file Filename to check.
 */
const whitelisted = (file: string) =>
    Object.keys(files).includes(file.split('.').slice(-1)[0] || '');

/**
 * Handle GET /libraries/:library/:version requests.
 *
 * @param ctx Request context.
 */
const handleGetLibraryVersion = async (ctx: Context) => {
    // Validate params (Hono already did this, but this keeps TypeScript happy)
    const params = ctx.req.param();
    if (!params.library || !params.version)
        throw new Error('Missing library or version param');

    // Get the library
    const lib = await library(params.library).catch((err) => {
        if (err.status === 404) return;
        throw err;
    });
    if (!lib) return notFound(ctx, 'Library');

    // Get the version
    const version = await libraryVersion(lib.name, params.version).catch(
        (err) => {
            if (err.status === 404) return;
            throw err;
        },
    );
    if (!version) return notFound(ctx, 'Version');

    // Generate the initial filtered response (without SRI data)
    const requestedFields = queryCheck(ctx.req.queries('fields'));
    const response: LibraryVersionResponse = filter(
        {
            name: lib.name,
            version: params.version,
            rawFiles: version,
            files: version.filter(whitelisted),
        },
        requestedFields,
    );

    // Load SRI data if needed
    if (requestedFields('sri')) {
        // Get SRI for version
        const latestSriData = await libraryVersionSri(
            lib.name,
            params.version,
        ).catch(() => ({}));
        response.sri = sriForVersion(
            lib.name,
            params.version,
            version,
            latestSriData,
        );
    }

    // Set a 355 day (same as CDN) life on this response
    // This is also immutable as a version will never change
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Send the response
    return respond<LibraryVersionResponse>(ctx, response);
};

/**
 * Handle GET /libraries/:library requests.
 *
 * @param ctx Request context.
 */
const handleGetLibrary = async (ctx: Context) => {
    // Validate params (Hono already did this, but this keeps TypeScript happy)
    const params = ctx.req.param();
    if (!params.library) throw new Error('Missing library or version param');

    // Get the library
    const lib = await library(params.library).catch((err) => {
        if (err.status === 404) return;
        throw err;
    });
    if (!lib) return notFound(ctx, 'Library');

    // Generate the initial filtered response (without SRI, versions or assets data)
    const requestedFields = queryCheck(ctx.req.queries('fields'));
    const { name, ...rest } = lib;
    const response: LibraryResponse = filter(
        {
            // Ensure name is first prop
            name,
            // Custom latest prop (and SRI value)
            latest:
                lib.filename && lib.version
                    ? 'https://cdnjs.cloudflare.com/ajax/libs/' +
                      lib.name +
                      '/' +
                      lib.version +
                      '/' +
                      lib.filename
                    : null,
            sri: null,
            // All other lib props
            ...rest,
        },
        requestedFields,
    );

    // Get versions if needed
    if (requestedFields('versions'))
        response.versions = await libraryVersions(lib.name);

    // Get assets if needed, inject SRI and do whitelist filtering
    // Returning assets for all versions is deprecated, we only return the latest version in the array
    if (requestedFields('assets')) {
        if (!lib.version) response.assets = [];
        else {
            // Fetch the assets for the version
            const assets = await libraryVersion(lib.name, lib.version);

            // Fetch the SRI data, ignore errors as they'll be reported by sriForVersion
            const sriData = await libraryVersionSri(
                lib.name,
                lib.version,
            ).catch(() => ({}));

            // Produce the assets array with just the latest version
            response.assets = [
                {
                    version: lib.version,
                    files: assets.filter(whitelisted),
                    rawFiles: assets,
                    sri: sriForVersion(lib.name, lib.version, assets, sriData),
                },
            ];
        }
    }

    // Load SRI for latest if needed
    if (requestedFields('sri')) {
        if (lib.filename && lib.version) {
            // Handle if we've already fetched SRI
            if (response.assets) {
                const latestVersion = response.assets.find(
                    (entry) => entry.version === lib.version,
                );
                if (latestVersion) {
                    if (lib.filename in latestVersion.sri) {
                        response.sri = latestVersion.sri[lib.filename];
                    }
                }
            }

            // If no SRI value yet, fetch
            if (!response.sri) {
                // Get SRI for version, ignore errors as they'll be reported by sriForVersion
                const latestSriData = await libraryVersionSri(
                    lib.name,
                    lib.version,
                ).catch(() => ({}));
                response.sri =
                    sriForVersion(
                        lib.name,
                        lib.version,
                        [lib.filename],
                        latestSriData,
                    )[lib.filename] || null;
            }
        }
    }

    // Set a 6 hour life on this response
    withCache(ctx, 6 * 60 * 60);

    // Send the response
    return respond<LibraryResponse>(ctx, response);
};

/**
 * Register library routes.
 *
 * @param app App instance.
 * @param registry OpenAPI registry instance.
 */
export default (app: Hono, registry: OpenAPIRegistry) => {
    // Library version
    app.get('/libraries/:library/:version', handleGetLibraryVersion);
    app.get('/libraries/:library/:version/', handleGetLibraryVersion);

    registry.registerPath({
        method: 'get',
        path: '/libraries/{library}/{version}',
        summary: 'Getting a specific version for a library on cdnjs',
        description: [
            'The `/libraries/:library/:version` endpoint returns a JSON object with details specific to a requested version of a library on cdnjs.',
            '',
            'The cache lifetime on this endpoint is 355 days, identical to the CDN. The response is also marked as immutable, as a version on cdnjs will never change once published.',
            '',
            'cdnjs only allows access to specific versions of a library, and these are considered immutable. Access to tags for a library, such as `latest`, is not supported as these have a mutable definition, which would go against what cdnjs aims to provide with long-life caching on responses and SRI hashes.',
        ].join('\n'),
        tags: ['libraries'],
        request: {
            params: z.object({
                library: z
                    .string()
                    .openapi({ description: 'Name of the library.' }),
                version: z
                    .string()
                    .openapi({ description: 'Version of the library.' }),
            }),
            query: z.object({
                fields: z.string().optional().openapi({
                    description:
                        'Provide a comma-separated string of fields to return in the library version object. If no field are specified, all fields will be returned.',
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

    // Library
    app.get('/libraries/:library', handleGetLibrary);
    app.get('/libraries/:library/', handleGetLibrary);

    registry.registerPath({
        method: 'get',
        path: '/libraries/{library}',
        summary: 'Getting a specific library on cdnjs',
        description: [
            'The `/libraries/:library` endpoint allows for data on a specific library to be requested and will return a JSON object with all library data properties by default.',
            '',
            'The cache lifetime on this endpoint is six hours.',
            '',
            '> Accessing `assets` for all versions of a library using this endpoint is deprecated. The `assets` property now only contains a single entry for the latest version. To access the assets of any version, use the `/libraries/:library/:version` endpoint.',
            '>',
            '> See [cdnjs/cdnjs issue #14140](https://github.com/cdnjs/cdnjs/issues/14140) for more information.',
        ].join('\n'),
        tags: ['libraries'],
        request: {
            params: z.object({
                library: z
                    .string()
                    .openapi({ description: 'Name of the library.' }),
            }),
            query: z.object({
                fields: z.string().optional().openapi({
                    description:
                        'Provide a comma-separated string of fields to return in the library object. If no field are specified, all fields will be returned.',
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
};
