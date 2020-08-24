// Local imports
const cache = require('../utils/cache');
const respond = require('../utils/respond');

module.exports = (app) => {
    // Update log
    app.get('/update', (req, res) => {
        // Set a 5 minute life on this response
        cache(res, 5 * 60);

        // Send the response
        respond(req, res, app.get('UPDATE'));
    });
};
