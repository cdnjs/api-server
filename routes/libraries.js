// Library imports
const algoliasearch = require('algoliasearch');
const Sentry = require('@sentry/node');

// Local imports
const cache = require('../utils/cache');
const filter = require('../utils/filter');
const respond = require('../utils/respond');
const queryArray = require('../utils/query_array');

// App constants
const index = algoliasearch('2QWLVLXZB6', 'e16bd99a5c7a8fccae13ad40762eec3c').initIndex('libraries');
const validSearchFields = ['name', 'alternativeNames', 'github.repo', 'description', 'keywords', 'filename',
    'repositories.url', 'github.user', 'maintainers.name'];
const maxQueryLength = 512;

// Search the algolia index in browser mode
const algolia = async (query, searchFields) => {
    const hits = [];
    await index.browseObjects({
        query,
        restrictSearchableAttributes: searchFields.filter(field => validSearchFields.includes(field)),
        batch: batch => {
            hits.push(...batch);
        },
    });
    return hits;
};

module.exports = app => {
    app.get('/libraries', async (req, res, next) => {
        try {
            // Get the index results
            const searchFields = queryArray(req.query, 'search_fields');
            const results = await algolia(
                (req.query.search || '').toString().slice(0, maxQueryLength),
                searchFields.includes('*') ? [] : searchFields,
            );

            // Transform the results into our filtered array
            const requestedFields = queryArray(req.query, 'fields');
            const response = results.filter(hit => {
                if (hit && hit.name) return true;
                console.warn('Found bad entry in Algolia data');
                console.info(hit);
                if (process.env.SENTRY_DSN) {
                    Sentry.withScope(scope => {
                        scope.setTag('hit.data', JSON.stringify(hit));
                        Sentry.captureException(new Error('Bad entry in Algolia data'));
                    });
                }
                return false;
            }).map(hit => {
                return filter(
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
                );
            });

            // If they want less data, allow that
            const limit = (req.query.limit && Number(req.query.limit));
            const trimmed = limit ? response.slice(0, limit) : response;

            // Set a 6 hour life on this response
            cache(res, 6 * 60 * 60);

            // Send the response
            respond(req, res, {
                results: trimmed,
                total: trimmed.length, // Total results we're sending back
                available: response.length, // Total number available without trimming
            });

        } catch (err) {
            next(err);
        }
    });
};
