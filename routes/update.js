// Local imports
const cache = require('../utils/cache');
const update = require('../utils/update');
const libraries = require('../utils/libraries');
const respond = require('../utils/respond');

module.exports = app => {
    // Start the updater, every 5 mins
    app.set('UPDATE', {});
    setInterval(() => {
        // Run the update
        app.set('UPDATE', update());

        // Load latest libraries into memory
        libraries.set(app);
    }, 5 * 60 * 1000);

    // Update log
    app.get('/update', (req, res) => {
        // Set a 2 minute life on this response
        cache(res, 2 * 60);

        // Send the response
        respond(req, res, app.get('UPDATE'));
    });
};
