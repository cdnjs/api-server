// Library imports
const fs = require('fs');
const path = require('path');

// Local imports
const cache = require('../utils/cache');
const tutorials = require('../utils/tutorials');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const files = require('../utils/files');
const queryArray = require('../utils/query_array');

// Filter util
const isWhitelisted = file => {
    const ext = path.extname(file).replace(/^\.+/g, '');
    return Object.keys(files).includes(ext);
};

module.exports = app => {
    // Library version
    app.get('/libraries/:library/:version', (req, res) => {
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
        const matches = lib.assets.filter(x => x.version === req.params.version);
        if (!matches.length) {
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
        const version = matches[0];

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
                response.sri = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sri', req.params.library, `${version.version}.json`), 'utf8'));
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
    });

    // Library
    app.get('/libraries/:library', (req, res) => {
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
                latest: 'https://cdnjs.cloudflare.com/ajax/libs/' + lib.name + '/' + lib.version + '/' + lib.filename,
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

        // Load SRI for latest if needed
        if ('sri' in response) {
            try {
                response.sri = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sri', req.params.library, `${lib.version}.json`), 'utf8'))[lib.filename];
            } catch (_) {
                // If we fail to load, leave it as null
            }
        }

        // Inject SRI into assets if in results and do whitelist filtering
        if ('assets' in response) {
            response.assets = response.assets.map(asset => {
                asset.rawFiles = [...asset.files];
                asset.files = asset.files.filter(isWhitelisted);

                try {
                    asset.sri = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sri', req.params.library, `${asset.version}.json`), 'utf8'));
                } catch (_) {
                    // If we can't load, set SRI to a blank object
                    asset.sri = {};
                }
                return asset;
            });
        }

        // Set a 6 hour life on this response
        cache(res, 6 * 60 * 60);

        // Send the response
        respond(req, res, response);
    });
};
