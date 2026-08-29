import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { Context, Hono } from 'hono';

import respond, { isWebsite, withCache } from '../utils/respond.ts';

import AboutPage from './about.page.tsx';

/**
 * Handle GET /about requests.
 *
 * @param ctx Request context.
 */
const handleGetAbout = (ctx: Context) => {
    // Render the React page for website requests
    if (isWebsite(ctx)) {
        return respond<undefined>(ctx, undefined, AboutPage, {
            title: 'About',
            description:
                'Learn more about cdnjs, how libraries are added, the team behind it, and the sponsors that make it possible to run this service for free.',
            keywords: ['about', 'team', 'sponsors'],
        });
    }

    // Set a 355 day (same as CDN) life on this response
    // This is also immutable
    withCache(ctx, 355 * 24 * 60 * 60, true);

    // Redirect to the about page
    return ctx.redirect('https://cdnjs.com/about', 301);
};

/**
 * Register about routes.
 *
 * @param app App instance.
 * @param _registry OpenAPI registry instance.
 */
export default (app: Hono, _registry: OpenAPIRegistry) => {
    // Redirect to the about page
    app.get('/about', handleGetAbout);
    app.get('/about/', handleGetAbout);
};
