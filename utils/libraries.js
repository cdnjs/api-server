// Library imports
const Sentry = require('@sentry/node');
const fetch = require('node-fetch');

// Get a list of libraries from KV
const kvLibraries = async () => {
    const resp = await fetch('https://metadata-staging.speedcdnjs.com/packages');
    return resp.json();
};

// Get the metadata for a library on KV
const kvLibrary = async library => {
    const resp = await fetch(`https://metadata-staging.speedcdnjs.com/packages/${library}`);
    return resp.json();
};

// Get the metadata for all libraries on KV
const kvAll = async () => {
    const libraryNames = await kvLibraries();

    // console.log('Libraries to fetch:', libraryNames.length);
    // const start = Date.now();

    const libraries = {};
    const processResponse = (name, data) => {
        // Non-breaking issues
        if (name !== data.name) {
            console.info('Name mismatch', name, data.name);
            data.name = name;
        }
        if (!data.assets) {
            console.info('Assets missing', name);
            data.assets = [];
        }

        // Breaking issues
        if (!data.version) {
            console.error('Version missing', name, data);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException({
                    name: 'Version missing in package data',
                    message: JSON.stringify(data),
                });
            }
            return;
        }

        // Store
        libraries[name] = data;
    };

    // Create all the promise functions
    const failed = [];
    const libraryPromises = libraryNames.map(name => (async () => {
        await kvLibrary(name).then(data => {
            if (data) processResponse(name, data);
        }).catch(() => failed.push(name));
    }));

    // Chunk up the functions to parallelize
    const libraryPromisesChunked = libraryPromises.reduce((prev, cur, i) => {
        if (i % 30 === 0) prev.push([]);
        prev[prev.length - 1].push(cur);
        return prev;
    }, []);

    // Fetch the chunks
    for (const chunk of libraryPromisesChunked) {
        await Promise.all(chunk.map(func => func()));
        // console.log('Time so far (ms):', Date.now() - start);
        // console.log('Libraries fetched:', Object.keys(libraries).length);
        // console.log('Time per chunk (ms):', (Date.now() - start) / (Object.keys(libraries).length / 30));
        // console.log('Failed requests:', failed.length);
    }

    // Fetch any failed requests
    const errors = [];
    for (const name of failed) {
        await kvLibrary(name).then(data => {
            if (data) processResponse(name, data);
        }).catch(e => {
            errors.push(`${name}: ${e.message}`);
            console.error('Failed to fetch', name, e.message);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException({
                    name: 'Failed to fetch package',
                    message: JSON.stringify([name, e.message, e]),
                });
            }
        });
    }

    // console.log('Time taken (ms):', Date.now() - start);
    // console.log('Libraries fetched:', Object.keys(libraries).length);
    // console.log('Time per chunk (ms):', (Date.now() - start) / (Object.keys(libraries).length / 30));

    return [libraries, errors];
};

module.exports = { kvAll };
