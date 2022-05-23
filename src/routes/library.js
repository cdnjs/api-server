import cache from '../utils/cache.js';
import files from '../utils/files.js';
import filter from '../utils/filter.js';
import { library, libraryVersion, libraryVersionSri, libraryFull, librarySri } from '../utils/kvMetadata.js';
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
    app.get('/libraries/:library/:version', async (ctx, next) => {
        // Don't run this handler if destined for tutorials handler
        if (ctx.req.param('version') === 'tutorials') {
            await next();
            return;
        }

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
        const lib = await libraryFull(ctx.req.param('library'), ctx.sentry).catch(err => {
            if (err.status === 404) return;
            throw err;
        });
        if (!lib) return notFound(ctx, 'Library');

        // Generate the initial filtered response (without SRI or tutorials data)
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
                versions: null,
                tutorials: null,
            },
            requestedFields,
            // If they requested no fields or '*', send them all
            !requestedFields.length || requestedFields.includes('*'),
        );

        // Compute versions if needed
        if ('versions' in response) {
            response.versions = lib.assets.map(asset => asset.version);
        }

        // Tutorials are deprecated, so return an empty array if requested
        if ('tutorials' in response) {
            response.tutorials = [];
        }

        // Inject SRI into assets if in results and do whitelist filtering
        if ('assets' in response) {
            // Get all SRI data
            const sriData = await librarySri(lib.name).catch(() => {});

            // Map assets
            response.assets = (response.assets || []).map(asset => {
                asset.rawFiles = [ ...(asset.files || []) ];
                asset.files = (asset.files || []).filter(whitelisted);
                asset.sri = sriForVersion(lib.name, asset.version, asset.rawFiles, sriData, ctx.sentry);
                return asset;
            });
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
                    // Get SRI for version
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
