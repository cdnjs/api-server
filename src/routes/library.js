import cache from '../utils/cache.js';
import files from '../utils/files.js';
import filter from '../utils/filter.js';
import { library, libraryVersion, libraryVersionSri, libraryVersions } from '../utils/kvMetadata.js';
import notFound from '../utils/notFound.js';
import queryArray from '../utils/queryArray.js';
import respond from '../utils/respond.js';
import sriForVersion from '../utils/sriForVersion.js';

const extensions = Object.keys(files);

/**
 * Check if a file is whitelisted for cdnjs, based on its extension.
 *
 * @param {string} file Filename to check.
 * @return {boolean}
 */
const whitelisted = file => extensions.includes(file.split('.').slice(-1)[0]);

/**
 * Register library routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    // Library version
    app.get('/libraries/:library/:version', async ctx => {
        // Get the library
        const lib = await library(ctx.req.param('library'), ctx.sentry).catch(err => {
            if (err.status === 404) return;
            throw err;
        });
        if (!lib) return notFound(ctx, 'Library');

        // Get the version
        const version = await libraryVersion(lib.name, ctx.req.param('version')).catch(err => {
            if (err.status === 404) return;
            throw err;
        });
        if (!version) return notFound(ctx, 'Version');

        // Build the object
        const results = {
            name: lib.name,
            version: ctx.req.param('version'),
            rawFiles: version,
            files: version.filter(whitelisted),
            sri: null,
        };

        // Generate the initial filtered response (without SRI data)
        const requestedFields = queryArray(ctx.req.queries('fields'));
        const response = filter(
            results,
            requestedFields,
            // If they requested no fields or '*', send them all
            !requestedFields.length || requestedFields.includes('*'),
        );

        // Load SRI data if needed
        if ('sri' in response) {
            // Get SRI for version
            const latestSriData = await libraryVersionSri(lib.name, ctx.req.param('version')).catch(() => {});
            response.sri = sriForVersion(lib.name, ctx.req.param('version'), version, latestSriData, ctx.sentry);
        }

        // Set a 355 day (same as CDN) life on this response
        // This is also immutable as a version will never change
        cache(ctx, 355 * 24 * 60 * 60, true);

        // Send the response
        return respond(ctx, response);
    });

    // Library
    app.get('/libraries/:library', async ctx => {
        // Get the library
        const lib = await library(ctx.req.param('library'), ctx.sentry).catch(err => {
            if (err.status === 404) return;
            throw err;
        });
        if (!lib) return notFound(ctx, 'Library');

        // Generate the initial filtered response (without SRI, tutorials, versions or assets data)
        const requestedFields = queryArray(ctx.req.queries('fields'));
        const response = filter(
            {
                // Ensure name is first prop
                name: lib.name,
                // Custom latest prop (and SRI value)
                latest: lib.filename && lib.version ? 'https://cdnjs.cloudflare.com/ajax/libs/' + lib.name + '/' + lib.version + '/' + lib.filename : null,
                sri: null,
                // All other lib props
                ...lib,
                tutorials: null,
                versions: null,
                assets: null,
            },
            requestedFields,
            // If they requested no fields or '*', send them all
            !requestedFields.length || requestedFields.includes('*'),
        );

        // Tutorials are deprecated, so return an empty array if requested
        if ('tutorials' in response) response.tutorials = [];

        // Get versions if needed
        if ('versions' in response) response.versions = await libraryVersions(lib.name);

        // Get assets if needed, inject SRI and do whitelist filtering
        // Returning assets for all versions is deprecated, we only return the latest version in the array
        if ('assets' in response) {
            if (!lib.version) response.assets = [];
            else {
                // Fetch the assets for the version
                const assets = await libraryVersion(lib.name, lib.version);

                // Fetch the SRI data, ignore errors as they'll be reported by sriForVersion
                const sriData = await libraryVersionSri(lib.name, lib.version).catch(() => {});

                // Produce the assets array with just the latest version
                response.assets = [ {
                    version: lib.version,
                    files: assets.filter(whitelisted),
                    rawFiles: assets,
                    sri: sriForVersion(lib.name, lib.version, assets, sriData, ctx.sentry),
                } ];
            }
        }

        // Load SRI for latest if needed
        if ('sri' in response) {
            if (lib.filename && lib.version) {
                // Handle if we've already fetched SRI
                if ('assets' in response) {
                    const latestVersion = response.assets.find(entry => entry.version === lib.version);
                    if (latestVersion) {
                        if (lib.filename in latestVersion.sri) {
                            response.sri = latestVersion.sri[lib.filename];
                        }
                    }
                }

                // If no SRI value yet, fetch
                if (!response.sri) {
                    // Get SRI for version, ignore errors as they'll be reported by sriForVersion
                    const latestSriData = await libraryVersionSri(lib.name, lib.version).catch(() => {});
                    response.sri = sriForVersion(
                        lib.name,
                        lib.version,
                        [ lib.filename ],
                        latestSriData,
                        ctx.sentry,
                    )[lib.filename] || null;
                }
            }
        }

        // Set a 6 hour life on this response
        cache(ctx, 6 * 60 * 60);

        // Send the response
        return respond(ctx, response);
    });
};
