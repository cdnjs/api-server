// Local imports
const cache = require('../utils/cache');

module.exports = app => {
    // 404
    app.use((req, res) => {
        // Set a 1 hour on this response
        cache(res, 60 * 60);

        // Send the error response
        res.status(404).json({
            error: true,
            status: 404,
            message: 'Endpoint not found',
        });
    });

    // 500
    app.use((err, req, res) => {
        console.error(err.stack);

        // Send the error response
        res.status(500).json({
            error: true,
            status: 500,
            message: err.message,
        });
    });
};
