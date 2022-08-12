/* global SENTRY_DSN, SENTRY_RELEASE, SENTRY_ENVIRONMENT */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import Toucan from 'toucan-js';

import errorRoutes from './routes/errors.js';
import indexRoutes from './routes/index.js';
import librariesRoutes from './routes/libraries.js';
import libraryRoutes from './routes/library.js';
import statsRoutes from './routes/stats.js';
import whitelistRoutes from './routes/whitelist.js';
import corsOptions from './utils/cors.js';

// Create the base app
const app = new Hono();
app.use('*', logger());
app.use('*', cors(corsOptions));

// Inject Sentry
if (typeof SENTRY_DSN === 'string') {
    app.use('*', async (ctx, next) => {
        // Create the Sentry instance
        ctx.sentry = new Toucan({
            dsn: SENTRY_DSN,
            context: ctx.event,
            allowedHeaders: [ 'user-agent', 'cf-ray' ],
            allowedSearchParams: /(.*)/,
            rewriteFrames: {
                /**
                 * @template {{ filename: string }} T
                 *
                 * Rewrite error stack frames to fix the source file path.
                 *
                 * @param {T} frame Stack frame to fix.
                 * @return {T}
                 */
                iteratee: frame => {
                    // Root should be `/`
                    frame.filename = frame.filename.replace(/^(async )?worker\.js/, '/worker.js');
                    return frame;
                },
            },
            release: (typeof SENTRY_RELEASE === 'string' ? SENTRY_RELEASE : '') || undefined,
            environment: (typeof SENTRY_ENVIRONMENT === 'string' ? SENTRY_ENVIRONMENT : '') || undefined,
        });

        // Track the colo we're in
        const colo = ctx.event.request.cf?.colo || 'UNKNOWN';
        ctx.sentry.setTag('colo', colo);

        // Track the connecting user
        const ipAddress = ctx.event.request.headers.get('cf-connecting-ip') || ctx.event.request.headers.get('x-forwarded-for') || undefined;
        const userAgent = ctx.event.request.headers.get('user-agent') || undefined;
        ctx.sentry.setUser({ ip: ipAddress, userAgent, colo });

        // Continue
        await next();
    });
}

// Load the routes
indexRoutes(app);
statsRoutes(app);
whitelistRoutes(app);
libraryRoutes(app);
librariesRoutes(app);
errorRoutes(app);

// Let's go!
addEventListener('fetch', event => {
    // Pass to hono
    event.respondWith(app.handleEvent(event));
});
