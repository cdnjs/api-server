// Local imports
const cache = require('../utils/cache');
const files = require('../utils/files');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const queryArray = require('../utils/query_array');

module.exports = app => {
    // Whitelist
    app.get('/whitelist', (req, res) => {
        // Build the object
        const results = {
            extensions: Object.keys(files),
            categories: files,
        };

        // Generate the filtered response
        const requestedFields = queryArray(req.query, 'fields');
        const response = filter(
            results,
            requestedFields,
            // If they requested no fields or '*', send them all
            !requestedFields.length || requestedFields.includes('*'),
        );

        // Set a 6 hour life on this response
        cache(res, 6 * 60 * 60);

        // Send the response
        respond(req, res, response);
    });
};
