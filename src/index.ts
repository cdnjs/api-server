import * as Sentry from '@sentry/cloudflare';
import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jsxRenderer } from 'hono/jsx-renderer';
import { logger } from 'hono/logger';

import errorRoutes from './routes/errors.ts';
import indexRoutes from './routes/index.ts';
import librariesRoutes from './routes/libraries.ts';
import libraryRoutes from './routes/library.ts';
import statsRoutes from './routes/stats.ts';
import whitelistRoutes from './routes/whitelist.ts';
import corsOptions from './utils/cors.ts';
import layout from './utils/jsx/layout.tsx';

// Create the base app
const app = new Hono();
if (!env.DISABLE_LOGGING) app.use('*', logger());
app.use('*', cors(corsOptions));
app.use('*', jsxRenderer(layout));

// Load the routes
indexRoutes(app);
statsRoutes(app);
whitelistRoutes(app);
libraryRoutes(app);
librariesRoutes(app);
errorRoutes(app);

// Let's go!
export default Sentry.withSentry<Cloudflare.Env>(
    (env) => ({
        dsn: env.SENTRY_DSN,
        release: env.SENTRY_RELEASE,
        environment: env.SENTRY_ENVIRONMENT,
    }),
    app,
);
