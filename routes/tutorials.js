// Local imports
const cache = require('../utils/cache');
const tutorials = require('../utils/tutorials');
const tutorial = require('../utils/tutorial');
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
            // Get the tutorial data
            const data = tutorial(req.params.library, req.params.tutorial);

            // Build the response and filter it
            const requestedFields = queryArray(req.query, 'fields');
            const response = filter(
                data,
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
