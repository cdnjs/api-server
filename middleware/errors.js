// Library imports
const Sentry = require('@sentry/node');

// Local imports
const notFound = require('../utils/not_found');
const cache = require('../utils/cache');

module.exports = {
    notFound: (req, res, next) => {
        notFound(req, res, 'Endpoint');
        next();
    },
    error: (err, req, res, next) => {
        console.error(err.stack);
        Sentry.captureException(err);

        // Never cache this
        cache(res, -1);

        // Send the error response
        res.status(500).json({
            error: true,
            status: 500,
            message: err.message,
        });

        next();
    },
};
