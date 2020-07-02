// Library imports
const express = require('express');
const compress = require('compression');
const Sentry = require('@sentry/node');
const morgan = require('morgan');

// Local imports
const librariesUtil = require('./utils/libraries');
const cacheUtil = require('./utils/cache');
const cors = require('./utils/cors');

// Routes imports
const librariesRoutes = require('./routes/libraries');
const tutorialsRoutes = require('./routes/tutorials');
const libraryRoutes = require('./routes/library');
const whitelistRoutes = require('./routes/whitelist');
const updateRoutes = require('./routes/update');
const errorsRoutes = require('./routes/errors');

// App constants
const port = Number(process.env.PORT || 5050);
const args = process.argv.slice(2);

// Local mode state
let localMode = false;
if (process.env.LOCAL === 'true' || (args.length > 0 && (args[0] === '--local' || args[2] === '--local'))) {
    console.log('local mode: on, gc() and updater disabled!');
    localMode = true;
} else {
    console.log('local mode: off');
}

// Garbage collection
if (!localMode && (typeof global.gc !== 'undefined')) {
    global.gc();
}

// Start sentry
if (!localMode) Sentry.init({ dsn: 'https://1ac0f4ae33304c22a586f099ac5cdb7d@o51786.ingest.sentry.io/5206370' });

module.exports = () => {
    // Basic app configuration
    const app = express();
    app.disable('x-powered-by');
    if (!localMode) app.use(Sentry.Handlers.requestHandler());

    app.use(morgan('combined'));

    // Load the library data
    librariesUtil.set(app);

    // Set up cors headers
    cors(app);

    // Always compress whatever we return
    app.use(compress());

    // Setup our routes
    librariesRoutes(app);
    tutorialsRoutes(app);
    libraryRoutes(app);
    whitelistRoutes(app);
    updateRoutes(app, localMode);

    // Redirect root the API docs
    app.get('/', (req, res) => {
        // Set a 355 day (same as CDN) life on this response
        // This is also immutable
        cacheUtil(res, 355 * 24 * 60 * 60, true);

        // Redirect to the API docs
        res.redirect(301, 'https://cdnjs.com/api');
    });

    // Catch-all errors
    if (!localMode) app.use(Sentry.Handlers.errorHandler());
    errorsRoutes(app);

    // START!
    app.listen(port, () => {
        console.log('Listening on ' + (localMode ? 'http://0.0.0.0:' : '') + port);
    });
};
