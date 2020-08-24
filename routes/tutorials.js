// Local imports
const { kvLibrary, kvCleanFetch } = require('../utils/libraries');
const cache = require('../utils/cache');
const tutorials = require('../utils/tutorials');
const tutorial = require('../utils/tutorial');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const queryArray = require('../utils/query_array');
const notFound = require('../utils/not_found');

module.exports = app => {
    // Library tutorials
    app.get('/libraries/:library/tutorials', async (req, res, next) => {
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

            // Get the tutorial data
            const results = tutorials(lib.name);

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
        } catch (err) {
            next(err);
        }
    });

    // Library tutorial
    app.get('/libraries/:library/tutorials/:tutorial', async (req, res, next) => {
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

            // Get the tutorial, if we fail to find it, assume 404
            try {
                // Get the tutorial data
                const data = tutorial(lib.name, req.params.tutorial);

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
                notFound(res, 'Tutorial');
            }
        } catch (err) {
            next(err);
        }
    });
};
