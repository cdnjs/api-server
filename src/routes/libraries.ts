import type { Context, Hono } from 'hono';
import * as Sentry from '@sentry/cloudflare';

import { libraries } from '../utils/algolia.ts';
import cache from '../utils/cache.ts';
import filter from '../utils/filter.ts';
import queryArray from '../utils/queryArray.ts';
import respond from '../utils/respond.ts';

// Map of lowercase fields to their proper case
const mixedCaseFields = {
    alternativenames: 'alternativeNames',
    filetype: 'fileType',
    originalname: 'originalName',
    objectid: 'objectID',
};

/**
 * Handle GET /libraries requests.
 *
 * @param ctx Request context.
 */
const handleGetLibraries = async (ctx: Context) => {
    // Get the index results
    const searchFields = queryArray(ctx.req.queries('search_fields'));
    const results = await libraries(
        ctx.req.query('search') || '',
        searchFields.includes('*') ? [] : searchFields,
    );

    // Transform the results into our filtered array
    const requestedFields = queryArray(ctx.req.queries('fields')).map(field => mixedCaseFields[field] || field);
    const response = results.filter(hit => {
        if (hit?.name) return true;
        console.warn('Found bad entry in Algolia data');
        console.info(hit);
        Sentry.withScope(scope => {
            scope.setExtra('hit', hit);
            Sentry.captureException(new Error('Bad entry in Algolia data'));
        });
        return false;
    }).map(hit => filter(
        {
            // Ensure name is first prop
            name: hit.name,
            // Custom latest prop
            latest: hit.filename && hit.version ? 'https://cdnjs.cloudflare.com/ajax/libs/' + hit.name + '/' + hit.version + '/' + hit.filename : null,
            // All other hit props
            ...hit,
        },
        [
            // Always send back name & latest
            'name',
            'latest',
            // Send back whatever else was requested
            ...requestedFields,
        ],
        requestedFields.includes('*'), // Send all if they have '*'
    ));

    // If they want less data, allow that
    const limit = ctx.req.query('limit') && Number(ctx.req.query('limit'));
    const trimmed = limit ? response.slice(0, limit) : response;

    // Set a 6 hour life on this response
    cache(ctx, 6 * 60 * 60);

    // Send the response
    return respond(ctx, {
        results: trimmed,
        total: trimmed.length, // Total results we're sending back
        available: response.length, // Total number available without trimming
    });
};

/**
 * Register libraries routes.
 *
 * @param app App instance.
 */
export default (app: Hono) => {
    app.get('/libraries', handleGetLibraries);
    app.get('/libraries/', handleGetLibraries);
};
