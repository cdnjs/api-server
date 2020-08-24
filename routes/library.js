// Library imports
const path = require('path');

// Local imports
const {
    kvFullLibrary, kvLibrary, kvLibraryVersion,
    kvLibrarySri, kvLibraryVersionSri,
    kvCleanFetch,
} = require('../utils/libraries');
const cache = require('../utils/cache');
const tutorials = require('../utils/tutorials');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const files = require('../utils/files');
const queryArray = require('../utils/query_array');
const sriForVersion = require('../utils/sri_for_version');

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
            const lib = await kvCleanFetch(
                kvLibrary,
                [ req.params.library ],
                res,
                next,
                'Library',
            );
            if (!lib) return;

            // Get the version
            const version = await kvCleanFetch(
                kvLibraryVersion,
                [ lib.name, req.params.version ],
                res,
                next,
                'Version',
            );
            if (!version) return;

            // Build the object
            const results = {
                name: lib.name,
                version: req.params.version,
                rawFiles: [...(version || [])],
                files: [...(version || [])].filter(isWhitelisted),
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
                // Get SRI for version
                const latestSriData = await kvLibraryVersionSri(lib.name, req.params.version).catch(() => {});

                try {
                    response.sri = sriForVersion(lib.name, req.params.version, [...(version || [])], latestSriData);
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
            const lib = await kvCleanFetch(
                kvFullLibrary,
                [ req.params.library ],
                res,
                next,
                'Library',
            );
            if (!lib) return;

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

            // Load tutorials if we need them
            if ('tutorials' in response) {
                response.tutorials = tutorials(req.params.library);
            }

            // Inject SRI into assets if in results and do whitelist filtering
            if ('assets' in response) {
                // Get all SRI data
                const sriData = await kvLibrarySri(req.params.library).catch(() => {});

                // Map assets
                response.assets = (response.assets || []).map(asset => {
                    asset.rawFiles = [...(asset.files || [])];
                    asset.files = [...(asset.files || [])].filter(isWhitelisted);
                    asset.sri = sriForVersion(req.params.library, asset.version, asset.rawFiles, sriData);
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
                        const latestSriData = await kvLibraryVersionSri(req.params.library, lib.version).catch(() => {});

                        if (latestSriData) {
                            response.sri = sriForVersion(
                                req.params.library,
                                lib.version,
                                [ lib.filename ],
                                latestSriData,
                            )[lib.filename] || null;
                        }
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
