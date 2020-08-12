// Library imports
const Sentry = require('@sentry/node');

// Local imports
const cache = require('../utils/cache');

module.exports = {
    notFound: (req, res, next) => {
        // Set a 1 hour on this response
        cache(res, 60 * 60);

        // Send the error response
        res.status(404).json({
            error: true,
            status: 404,
            message: 'Endpoint not found',
        });

        next();
    },
    error: (err, req, res, next) => {
        console.error(err.stack);
        Sentry.captureException(err);

        // Send the error response
        res.status(500).json({
            error: true,
            status: 500,
            message: err.message,
        });

        next();
    },
};
