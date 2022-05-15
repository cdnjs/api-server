// Library imports
const express = require('express');
const compress = require('compression');
const Sentry = require('@sentry/node');
const morgan = require('morgan');

// Local imports
const cors = require('./utils/cors');

// Middleware imports
const timingMiddleware = require('./middleware/timing');
const errorsMiddleware = require('./middleware/errors');

// Routes imports
const librariesRoutes = require('./routes/libraries');
const tutorialsRoutes = require('./routes/tutorials');
const libraryRoutes = require('./routes/library');
const whitelistRoutes = require('./routes/whitelist');
const statsRoutes = require('./routes/stats');
const indexRoutes = require('./routes/index');
const testingRoutes = require('./routes/testing');

// App constants
const port = Number(process.env.PORT || 5050);
const args = process.argv.slice(2);
const started = Date.now();

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
if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    console.log('sentry: enabled');
} else {
    console.log('sentry: disabled');
}

module.exports = async () => {
    // Basic app configuration
    const app = express();
    app.disable('x-powered-by');

    // Setup timing middleware
    app.use(timingMiddleware);

    // Enable sentry
    if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.requestHandler());

    // Request logging
    app.use(morgan('combined'));

    // Set up cors headers
    cors(app);

    // Always compress whatever we return
    app.use(compress());

    // Setup our routes
    librariesRoutes(app);
    tutorialsRoutes(app);
    libraryRoutes(app);
    whitelistRoutes(app);
    statsRoutes(app);
    indexRoutes(app);
    if (localMode) testingRoutes(app);

    // Catch-all errors
    if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.errorHandler());

    // Handle 404s cleanly
    app.use(errorsMiddleware.notFound);

    // Handle error responses
    app.use(errorsMiddleware.error);

    // START!
    app.listen(port, () => {
        console.log('Listening on ' + (localMode ? 'http://0.0.0.0:' : '') + port
            + ' after ' + (Date.now() - started).toLocaleString() + 'ms');
    });
};
