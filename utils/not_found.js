// Local imports
const cache = require('./cache');

module.exports = (res, item) => {
    // Set a 1 hour on this response
    cache(res, 60 * 60);

    // Send the error response
    res.status(404).json({
        error: true,
        status: 404,
        message: `${item} not found`,
    });
};
