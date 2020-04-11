// Library imports
const algoliasearch = require('algoliasearch');

// Local imports
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
}

module.exports = app => {
    app.get('/libraries', async (req, res) => {
        // Set a 6 hour life on this response
        res.setHeader('Expires', new Date(Date.now() + 360 * 60 * 1000).toUTCString());

        // Get the index results
        const results = await algolia(req.query.search || '');

        // Transform the results into our filtered array
        const response = results.map(hit => {
            return filter(
                {
                    name: hit.name,
                    latest: 'https://cdnjs.cloudflare.com/ajax/libs/' + hit.name + '/' + hit.version + '/' + hit.filename,
                    ...hit
                },
                [
                    'name',
                    'latest',
                    ...((req.query.fields && req.query.fields.split(',')) || [])
                ],
            );
        });

        // Send the response
        respond(req, res, {
            results: response,
            total: response.length
        });
    });
}
