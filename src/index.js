import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors'
import corsOptions from './utils/cors.js';

// Import all the routes
import indexRoutes from './routes';

// Create the base app
const app = new Hono();
app.use('*', logger());
app.use('*', cors(corsOptions));

// Load the routes
indexRoutes(app);

// Let's go!
app.fire();
