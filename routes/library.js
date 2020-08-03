// Library imports
const path = require('path');

// Local imports
const cache = require('../utils/cache');
const tutorials = require('../utils/tutorials');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const files = require('../utils/files');
const queryArray = require('../utils/query_array');
const sriForVersion = require('../utils/sri_for_version');
const libraries = require('../utils/libraries');

// Filter util
const isWhitelisted = file => {
    const ext = path.extname(file).replace(/^\.+/g, '');
    return Object.keys(files).includes(ext);
};

module.exports = app => {
    // Library version
    app.get('/libraries/:library/:version', async (req, res, next) => {
        try {
            // Get the library
            const lib = app.get('LIBRARIES')[req.params.library];
            if (!lib) {
                // Set a 1 hour on this response
                cache(res, 60 * 60);

                // Send the error response
                res.status(404).json({
                    error: true,
                    status: 404,
                    message: 'Library not found',
                });
                return;
            }

            // Get the version
            let version;
            try {
                version = await libraries.kvLibraryVersion(req.params.library, req.params.version);
            } catch (err) {
                if (err.status === 404) {
                    // Set a 1 hour on this response
                    cache(res, 60 * 60);

                    // Send the error response
                    res.status(404).json({
                        error: true,
                        status: 404,
                        message: 'Version not found',
                    });
                    return;
                }

                // Not a 404, raise
                next(err);
                return;
            }

            // Build the object
            const results = {
                name: lib.name,
                version: version.version,
                rawFiles: [...version.files],
                files: version.files.filter(isWhitelisted),
                sri: null,
            };

            // Generate the initial filtered response (without SRI data)
            const requestedFields = queryArray(req.query, 'fields');
            const response = filter(
                results,
                requestedFields,
                // If they requested no fields or '*', send them all
                !requestedFields.length || requestedFields.includes('*'),
            );

            // Load SRI data if needed
            if ('sri' in response) {
                try {
                    response.sri = sriForVersion(req.params.library, version.version, version.files);
                } catch (_) {
                    // If we can't load, set SRI to a blank object
                    response.sri = {};
                }
            }

            // Set a 355 day (same as CDN) life on this response
            // This is also immutable as a version will never change
            cache(res, 355 * 24 * 60 * 60, true);

            // Send the response
            respond(req, res, response);

        } catch (err) {
            next(err);
        }
    });

    // Library
    app.get('/libraries/:library', async (req, res, next) => {
        try {
            // Get the library
            const lib = app.get('LIBRARIES')[req.params.library];
            if (!lib) {
                // Set a 1 hour on this response
                cache(res, 60 * 60);

                // Send the error response
                res.status(404).json({
                    error: true,
                    status: 404,
                    message: 'Library not found',
                });
                return;
            }

            // Generate the initial filtered response (without SRI or tutorials data)
            const requestedFields = queryArray(req.query, 'fields');
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
                    assets: null,
                    tutorials: null,
                },
                requestedFields,
                // If they requested no fields or '*', send them all
                !requestedFields.length || requestedFields.includes('*'),
            );

            // Get versions if needed
            let versions;
            if ('versions' in response || 'assets' in response) {
                versions = await libraries.kvLibraryVersions(response.name);
            }

            // Compute versions if needed
            if ('versions' in response) {
                response.versions = versions;
            }

            // Get the assets if needed
            // Inject SRI into assets and do whitelist filtering
            if ('assets' in response) {
                const rawAssets = await libraries.kvLibraryAssets(response.name, versions);
                response.assets = rawAssets.map(asset => {
                    asset.rawFiles = [...asset.files];
                    asset.files = asset.files.filter(isWhitelisted);

                    try {
                        asset.sri = sriForVersion(req.params.library, asset.version, asset.rawFiles);
                    } catch (_) {
                        // If we can't load, set SRI to a blank object
                        asset.sri = {};
                    }
                    return asset;
                });
            }

            // Load tutorials if we need them
            if ('tutorials' in response) {
                response.tutorials = tutorials(req.params.library);
            }

            // Load SRI for latest if needed
            if ('sri' in response) {
                if (lib.filename && lib.version) {
                    try {
                        response.sri = sriForVersion(req.params.library, lib.version, [lib.filename])[lib.filename];
                    } catch (_) {
                        // If we fail to load, leave it as null
                    }
                }
            }

            // Set a 6 hour life on this response
            cache(res, 6 * 60 * 60);

            // Send the response
            respond(req, res, response);

        } catch (err) {
            next(err);
        }
    });
};
