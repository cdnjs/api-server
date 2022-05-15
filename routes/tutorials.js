// Local imports
const { kvLibrary, kvCleanFetch } = require('../utils/libraries');
const cache = require('../utils/cache');
const respond = require('../utils/respond');
const notFound = require('../utils/not_found');

module.exports = app => {
    // Library tutorials
    app.get('/libraries/:library/tutorials', async (req, res, next) => {
        try {
            // Get the library
            const lib = await kvCleanFetch(
                kvLibrary,
                [ req.params.library ],
                req,
                res,
                next,
                'Library',
            );
            if (!lib) return;

            // Set a 24 hour life on this response
            cache(res, 24 * 60 * 60);

            // Tutorials are deprecated, return none
            respond(req, res, []);
        } catch (err) {
            next(err);
        }
    });

    // Library tutorial
    app.get('/libraries/:library/tutorials/:tutorial', async (req, res, next) => {
        try {
            // Get the library
            const lib = await kvCleanFetch(
                kvLibrary,
                [ req.params.library ],
                req,
                res,
                next,
                'Library',
            );
            if (!lib) return;

            // Tutorials are deprecated, return a 404
            notFound(req, res, 'Tutorial');
        } catch (err) {
            next(err);
        }
    });
};
