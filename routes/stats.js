// Local imports
const { kvLibraries } = require('../utils/libraries');
const cache = require('../utils/cache');
const queryArray = require('../utils/query_array');
const filter = require('../utils/filter');
const respond = require('../utils/respond');

module.exports = app => {
    app.get('/stats', async (req, res, next) => {
        try {
            const libs = await kvLibraries();
            const requestedFields = queryArray(req.query, 'fields');
            const response = filter(
                {
                    libraries: libs.length,
                },
                requestedFields,
                // If they requested no fields or '*', send them all
                !requestedFields.length || requestedFields.includes('*'),
            );

            // Set a 6 hour life on this response
            cache(res, 6 * 60 * 60);

            // Send the response
            respond(req, res, response);
        } catch (err) {
            next(err);
        }
    });
};
