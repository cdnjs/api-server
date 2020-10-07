// Local imports
const cache = require('./cache');
const respond = require('./respond');

module.exports = (req, res, item) => {
    // Set a 1 hour on this response
    cache(res, 60 * 60);

    // Send the error response
    res.status(404);
    respond(req, res, {
        error: true,
        status: 404,
        message: `${item} not found`,
    });
};
