// Library imports
const fs = require('fs');
const path = require('path');

// Local imports
const tutorials = require('../utils/tutorials');
const filter = require('../utils/filter');
const respond = require('../utils/respond');

module.exports = app => {
    // Library version
    app.get('/libraries/:library/:version', (req, res) => {
        // Set a 2 week life on this response
        res.setHeader('Expires', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toUTCString());

        // Get the library
        const lib = app.get('LIBRARIES')[req.params.library];
        if (!lib) {
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
            ...version,
            sri: null,
        };

        // Generate the initial filtered response (without SRI data)
        const requestedFields = (req.query.fields && req.query.fields.split(',')) || [];
        const response = filter(
            results,
            requestedFields,
            !requestedFields.length, // If they requested no fields, send them all
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

        // Send the response
        respond(req, res, response);
    });

    // Library
    app.get('/libraries/:library', (req, res) => {
        // Set a 6 hour life on this response
        res.setHeader('Expires', new Date(Date.now() + 6 * 60 * 60 * 1000).toUTCString());

        // Get the library
        const lib = app.get('LIBRARIES')[req.params.library];
        if (!lib) {
            res.status(404).json({
                error: true,
                status: 404,
                message: 'Library not found',
            });
            return;
        }

        // Generate the initial filtered response (without SRI or tutorials data)
        const requestedFields = (req.query.fields && req.query.fields.split(',')) || [];
        const response = filter(
            {
                // Ensure name is first prop
                name: lib.name,
                // Custom latest prop (and SRI value)
                latest: 'https://cdnjs.cloudflare.com/ajax/libs/' + lib.name + '/' + lib.version + '/' + lib.filename,
                sri: null,
                // All other lib props
                ...lib,
                tutorials: null,
            },
            requestedFields,
            !requestedFields.length, // If they requested no fields, send them all
        );

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

        // Inject SRI into assets if in results
        if ('assets' in response) {
            response.assets = response.assets.map(asset => {
                try {
                    asset.sri = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sri', req.params.library, `${asset.version}.json`), 'utf8'));
                } catch (_) {
                    // If we can't load, set SRI to a blank object
                    asset.sri = {};
                }
                return asset;
            });
        }

        // Send the response
        respond(req, res, response);
    });
};
