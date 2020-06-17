// Library imports
const fs = require('fs');
const path = require('path');

// Local imports
const cache = require('../utils/cache');
const tutorials = require('../utils/tutorials');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const queryArray = require('../utils/query_array');

module.exports = app => {
    // Library tutorials
    app.get('/libraries/:library/tutorials', (req, res) => {
        // Check the library exists
        if (!app.get('LIBRARIES')[req.params.library]) {
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

        // Get the tutorial data
        const results = tutorials(req.params.library);

        // Filter the results
        const requestedFields = queryArray(req.query, 'fields');
        const response = results.map(data => {
            return filter(
                data,
                [
                    // Always return id
                    'id',
                    // Send back whatever else was requested
                    ...requestedFields,
                ],
                // If they requested no fields or '*', send them all
                !requestedFields.length || requestedFields.includes('*'),
            );
        });

        // Set a 24 hour life on this response
        cache(res, 24 * 60 * 60);

        // Send the response
        respond(req, res, response);
    });

    // Library tutorial
    app.get('/libraries/:library/tutorials/:tutorial', (req, res) => {
        // Check the library exists
        if (!app.get('LIBRARIES')[req.params.library]) {
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

        // Get the tutorial, if we fail to find it, assume 404
        try {
            // Get the tutorial meta & content
            const base = path.join(__dirname, '..', 'data', 'tutorials', req.params.library);
            const data = JSON.parse(fs.readFileSync(path.join(base, req.params.tutorial, 'tutorial.json'), 'utf8'));
            const content = fs.readFileSync(path.join(base, req.params.tutorial, 'index.md'), 'utf8');

            // Get the tutorial modified date
            const modified = fs.readFileSync(path.join(__dirname, '..', 'data', 'tutorialsModified.txt'), 'utf8');
            const modifiedReg = new RegExp(`(?:^|\n)${path.join(req.params.library, req.params.tutorial, 'tutorial.json')}: (.+)(?:$|\n)`);
            const modifiedMatch = modified.match(modifiedReg);

            // Build the response and filter it
            const requestedFields = queryArray(req.query, 'fields');
            const response = filter(
                {
                    id: req.params.tutorial,
                    modified: modifiedMatch && modifiedMatch.length ? new Date(modifiedMatch[1]) : new Date(),
                    ...data,
                    content,
                },
                requestedFields,
                // If they requested no fields or '*', send them all
                !requestedFields.length || requestedFields.includes('*'),
            );

            // Set a 2 week life on this response
            cache(res, 14 * 24 * 60 * 60);

            // Send the response
            respond(req, res, response);
        } catch (_) {
            // Set a 1 hour on this response
            cache(res, 60 * 60);

            // Send the error response
            res.status(404).json({
                error: true,
                status: 404,
                message: 'Tutorial not found',
            });
        }
    });
};
