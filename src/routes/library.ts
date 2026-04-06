import type { Context, Hono } from 'hono';

import cache from '../utils/cache.ts';
import files from '../utils/files.ts';
import filter from '../utils/filter.ts';
import {
    library,
    libraryVersion,
    libraryVersionSri,
    libraryVersions,
} from '../utils/metadata.ts';
import { queryCheck } from '../utils/query.ts';
import respond, { notFound } from '../utils/respond.ts';

import type {
    LibraryResponse,
    LibraryVersionResponse,
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
    cache(ctx, 355 * 24 * 60 * 60, true);

    // Send the response
    return respond(ctx, response);
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
    cache(ctx, 6 * 60 * 60);

    // Send the response
    return respond(ctx, response);
};

/**
 * Register library routes.
 *
 * @param app App instance.
 */
export default (app: Hono) => {
    // Library version
    app.get('/libraries/:library/:version', handleGetLibraryVersion);
    app.get('/libraries/:library/:version/', handleGetLibraryVersion);

    // Library
    app.get('/libraries/:library', handleGetLibrary);
    app.get('/libraries/:library/', handleGetLibrary);
};
