import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import errorRoutes from './routes/errors.js';
import indexRoutes from './routes/index.js';
import librariesRoutes from './routes/libraries.js';
import libraryRoutes from './routes/library.js';
import statsRoutes from './routes/stats.js';
import tutorialsRoutes from './routes/tutorials.js';
import whitelistRoutes from './routes/whitelist.js';
import corsOptions from './utils/cors.js';

// Import all the routes

// Create the base app
const app = new Hono();
app.use('*', logger());
app.use('*', cors(corsOptions));

// Patch req.query
app.use('*', async (ctx, next) => {
    const params = new URL(ctx.req.url).searchParams;

    /**
     * Fetch a query parameter, or all query parameters, from the request.
     *
     * @type {(function(): Object<string, string|string[]>) & (function(string): string|string[]|undefined)}
     */
    ctx.req.query = (field = undefined) => {
        if (field) {
            const values = params.getAll(field);
            return values.length < 2 ? values[0] : values;
        }

        return [ ...params.entries() ].reduce((obj, [ key, value ]) => ({
            ...obj,
            [key]: obj[key]
                ? (Array.isArray(obj[key]) ? obj[key] : [ obj[key] ]).concat([ value ])
                : value,
        }), {});
    };
    await next();
});

// Load the routes
indexRoutes(app);
statsRoutes(app);
whitelistRoutes(app);
libraryRoutes(app);
tutorialsRoutes(app);
librariesRoutes(app);
errorRoutes(app);

// Let's go!
app.fire();