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

// Create the base app
const app = new Hono();
app.use('*', logger());
app.use('*', cors(corsOptions));

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
