/* global CACHE */

import algolia from '../utils/algolia.js';
import cache from '../utils/cache.js';
import filter from '../utils/filter.js';
import queryArray from '../utils/queryArray.js';
import respond from '../utils/respond.js';

const index = algolia().initIndex('libraries');

// Fields configured in Algolia to be searchable
const validSearchFields = [ 'name', 'alternativeNames', 'github.repo', 'description', 'keywords', 'filename',
    'repositories.url', 'github.user', 'maintainers.name' ];

// Max query length that Algolia will accept
const maxQueryLength = 512;

// Map of lowercase fields to their proper case
const mixedCaseFields = {
    alternativenames: 'alternativeNames',
    filetype: 'fileType',
    originalname: 'originalName',
    objectid: 'objectID',
};

/**
 * Convert an ArrayBuffer to a hex string.
 *
 * @param {ArrayBuffer} buf Buffer to convert.
 * @return {string}
 */
const bufToHex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

/**
 * Browse an Algolia index to get all objects matching a query.
 *
 * @param {string} query Query to fetch matching objects for.
 * @param {string[]} searchFields Fields to consider for query.
 * @return {Promise<Object[]>}
 */
const browse = async (query, searchFields) => {
    // Normalize the search fields
    const fields = searchFields.filter(field => validSearchFields.includes(field)).sort();

    // Check if there is a cached result for this query
    const cacheKey = await crypto.subtle.digest(
        { name: 'SHA-512' },
        new TextEncoder().encode(`${query}:${fields.join(',')}`),
    ).then(buf => `libraries:${bufToHex(buf)}`);
    const cached = await CACHE.get(cacheKey, { type: 'json' });
    if (cached) return cached;

    // Fetch the results from Algolia
    const hits = [];
    await index.browseObjects({
        query,
        restrictSearchableAttributes: fields,
        /**
         * Store an incoming batch of hits.
         *
         * @param {Object[]} batch Incoming batch.
         */
        batch: batch => {
            hits.push(...batch);
        },
    }).catch(err => {
        throw err instanceof Error ? err : new Error(`${err.name}: ${err.message}`);
    });

    // Cache the results for 15 minutes
    await CACHE.put(cacheKey, JSON.stringify(hits), { expirationTtl: 60 * 15 });
    return hits;
};

/**
 * Handle GET /libraries requests.
 *
 * @param {import('hono').Context} ctx Request context.
 * @return {Promise<Response>}
 */
const handleGetLibraries = async ctx => {
    // Get the index results
    const searchFields = queryArray(ctx.req.queries('search_fields'));
    const results = await browse(
        (ctx.req.query('search') || '').toString().slice(0, maxQueryLength),
        searchFields.includes('*') ? [] : searchFields,
    );

    // Transform the results into our filtered array
    const requestedFields = queryArray(ctx.req.queries('fields')).map(field => mixedCaseFields[field] || field);
    const response = results.filter(hit => {
        if (hit?.name) return true;
        console.warn('Found bad entry in Algolia data');
        console.info(hit);
        ctx.sentry?.withScope(scope => {
            scope.setExtra('hit', hit);
            ctx.sentry.captureException(new Error('Bad entry in Algolia data'));
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
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    app.get('/libraries', handleGetLibraries);
    app.get('/libraries/', handleGetLibraries);
};
