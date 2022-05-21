import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors'
import corsOptions from './utils/cors.js';

// Import all the routes
import indexRoutes from './routes/index.js';
import statsRoutes from './routes/stats.js';
import whitelistRoutes from './routes/whitelist.js';
import tutorialsRoutes from './routes/tutorials.js';
import errorRoutes from './routes/errors.js';


// Create the base app
const app = new Hono();
app.use('*', logger());
app.use('*', cors(corsOptions));

// Patch req.query
app.use('*', async (ctx, next) => {
    const params = new URL(ctx.req.url).searchParams;
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
tutorialsRoutes(app);
errorRoutes(app);

// Let's go!
app.fire();
