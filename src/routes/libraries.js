import algolia from '../utils/algolia.js';
import cache from '../utils/cache.js';
import filter from '../utils/filter.js';
import queryArray from '../utils/queryArray.js';
import respond from '../utils/respond.js';

const index = algolia().initIndex('libraries');
const validSearchFields = [ 'name', 'alternativeNames', 'github.repo', 'description', 'keywords', 'filename',
    'repositories.url', 'github.user', 'maintainers.name' ];
const maxQueryLength = 512;

/**
 * Browse an Algolia index to get all objects matching a query.
 *
 * @param {string} query Query to fetch matching objects for.
 * @param {string[]} searchFields Fields to consider for query.
 * @return {Promise<Object[]>}
 */
const browse = async (query, searchFields) => {
    const hits = [];
    await index.browseObjects({
        query,
        restrictSearchableAttributes: searchFields.filter(field => validSearchFields.includes(field)),
        /**
         * Store an incoming batch of hits.
         *
         * @param {Object[]} batch Incoming batch.
         */
        batch: batch => {
            hits.push(...batch);
        },
    });
    return hits;
};

/**
 * Register libraries routes.
 *
 * @param {import('hono').Hono} app App instance.
 */
export default app => {
    app.get('/libraries', async ctx => {
        // Get the index results
        const searchFields = queryArray(ctx.req.queries('search_fields'));
        const results = await browse(
            (ctx.req.query('search') || '').toString().slice(0, maxQueryLength),
            searchFields.includes('*') ? [] : searchFields,
        );

        // Transform the results into our filtered array
        const requestedFields = queryArray(ctx.req.queries('fields'));
        const response = results.filter(hit => {
            if (hit && hit.name) return true;
            console.warn('Found bad entry in Algolia data');
            console.info(hit);
            // TODO: Sentry
            // if (process.env.SENTRY_DSN) {
            //     Sentry.withScope(scope => {
            //         scope.setTag('hit.data', JSON.stringify(hit));
            //         Sentry.captureException(new Error('Bad entry in Algolia data'));
            //     });
            // }
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
    });
};
