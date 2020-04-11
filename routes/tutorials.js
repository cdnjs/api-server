// Library imports
const fs = require('fs');
const path = require('path');

// Local imports
const tutorials = require('../utils/tutorials');
const filter = require('../utils/filter');
const respond = require('../utils/respond');

module.exports = app => {
    // Library tutorials
    app.get('/libraries/:library/tutorials', (req, res) => {
        // Set a 12 hour life on this response
        res.setHeader('Expires', new Date(Date.now() + 12 * 60 * 60 * 1000).toUTCString());

        // Get the tutorial data
        const results = tutorials(req.params.library);

        // Filter the results
        const requestedFields = (req.query.fields && req.query.fields.split(',')) || [];
        const response = results.map(data => {
            return filter(
                data,
                [
                    // Always return id
                    'id',
                    // Send back whatever else was requested
                    ...requestedFields,
                ],
                // If they requested no fields, send them all
                !requestedFields.length,
            );
        });

        // Send the response
        respond(req, res, response);
    });

    // Library tutorial
    app.get('/libraries/:library/tutorials/:tutorial', (req, res) => {
        // Set a 2 week life on this response
        res.setHeader('Expires', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toUTCString());

        // Get the tutorial, if we fail to find it, assume 404
        try {
            const base  = path.join(__dirname, '..', 'data', 'tutorials', req.params.library);
            const data = JSON.parse(fs.readFileSync(path.join(base, req.params.tutorial, 'tutorial.json'), 'utf8'));
            const content = fs.readFileSync(path.join(base, req.params.tutorial, 'index.md'), 'utf8');

            // Build the response and filter it
            const requestedFields = (req.query.fields && req.query.fields.split(',')) || [];
            const response = filter(
                {
                    id: req.params.tutorial,
                    ...data,
                    content,
                },
                requestedFields,
                !requestedFields.length, // If they requested no fields, send them all
            );

            // Send the response
            respond(req, res, response);
        } catch (_) {
            res.status(404).json({
                error: true,
                status: 404,
                message: 'Tutorial not found',
            });
        }
    });
};
