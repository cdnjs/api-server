// Local imports
const cache = require('../utils/cache');

module.exports = app => {
    // Redirect root the API docs
    app.get('/', (req, res) => {
        // Set a 355 day (same as CDN) life on this response
        // This is also immutable
        cache(res, 355 * 24 * 60 * 60, true);

        // Redirect to the API docs
        res.redirect(301, 'https://cdnjs.com/api');
    });

    // Respond that the API is up
    app.get('/health', (req, res) => {
        // Don't cache health, ensure its always live
        cache(res, -1);

        // Respond
        res.type('text/plain');
        res.send('OK');
    });

    // Don't ever index anything on the API
    app.get('/robots.txt', (req, res) => {
        // Set a 355 day (same as CDN) life on this response
        // This is also immutable
        cache(res, 355 * 24 * 60 * 60, true);

        // Disallow all robots
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /');
    });
};
