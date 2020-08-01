// Local imports
const cache = require('../utils/cache');
const update = require('../utils/update');
const respond = require('../utils/respond');
const libraries = require('../utils/libraries');

module.exports = (app, localMode) => {
    app.set('UPDATE', {});

    // Start the updater, every 10 mins, if not in local mode
    if (!localMode) {
        setInterval(() => {
            update(app);
        }, 10 * 60 * 1000);
    }

    // Update log
    app.get('/update', (req, res) => {
        // Set a 5 minute life on this response
        cache(res, 5 * 60);

        // Send the response
        respond(req, res, app.get('UPDATE'));
    });

    // Test KV data
    app.get('/update-kv', async (req, res) => {
        libraries.kvAll().then(() => {});
        respond(req, res, {});
    });
};
