// Library imports
const algoliasearch = require('algoliasearch');

// Local imports
const cache = require('../utils/cache');
const filter = require('../utils/filter');
const respond = require('../utils/respond');

// App constants
const index = algoliasearch('2QWLVLXZB6', 'e16bd99a5c7a8fccae13ad40762eec3c').initIndex('libraries');

// Search the algolia index in browser mode
const algolia = async query => {
    const hits = [];
    await index.browseObjects({
        query,
        batch: batch => {
            hits.push(...batch);
        },
    });
    return hits;
};

module.exports = app => {
    app.get('/libraries', async (req, res) => {
        // Set a 6 hour life on this response
        cache(res, 6 * 60 * 60);

        // Get the index results
        const results = await algolia(req.query.search || '');

        // Transform the results into our filtered array
        const response = results.map(hit => {
            return filter(
                {
                    // Ensure name is first prop
                    name: hit.name,
                    // Custom latest prop
                    latest: 'https://cdnjs.cloudflare.com/ajax/libs/' + hit.name + '/' + hit.version + '/' + hit.filename,
                    // All other hit props
                    ...hit,
                },
                [
                    // Always send back name & latest
                    'name',
                    'latest',
                    // Send back whatever else was requested
                    ...((req.query.fields && req.query.fields.split(',')) || []),
                ],
            );
        });

        // If they want less data, allow that
        const limit = (req.query.limit && Number(req.query.limit));
        const trimmed = limit ? response.slice(0, limit) : response;

        // Send the response
        respond(req, res, {
            results: trimmed,
            total: trimmed.length, // Total results we're sending back
            available: response.length, // Total number available without trimming
        });
    });
};
