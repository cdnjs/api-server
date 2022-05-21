// Library imports
const Sentry = require('@sentry/node');
const fetch = require('node-fetch');
const gunzip = require('gunzip-maybe');

// Local imports
const notFound = require('./not_found');

// Execute a set of async functions in chunks of 30
const chunkedAsync = async (asyncFunctionsMap, errorHandler) => {
    const failed = [];
    const data = {};

    // Create all the promise functions
    const promises = Object.keys(asyncFunctionsMap).map(name => (async () => {
        await asyncFunctionsMap[name]().then(resp => {
            if (resp) data[name] = resp;
        }).catch(() => failed.push(name));
    }));

    // Chunk up the functions to parallelize
    const promisesChunked = promises.reduce((prev, cur, i) => {
        if (i % 30 === 0) prev.push([]);
        prev[prev.length - 1].push(cur);
        return prev;
    }, []);

    // Fetch the chunks
    for (const chunk of promisesChunked) {
        await Promise.all(chunk.map(func => func()));
    }

    // Fetch any failed requests
    for (const name of failed) {
        await asyncFunctionsMap[name]().then(resp => {
            if (resp) data[name] = resp;
        }).catch(e => errorHandler(name, e));
    }

    return data;
};

// Get the metadata for a library's version on KV
const kvLibraryVersion = async (library, version) => {
    // Get the data
    const url = `${kvBase}/packages/${encodeURIComponent(library)}/versions/${encodeURIComponent(version)}`;
    const data = await jsonCachedFetch(url);

    // Treat empty as 404
    if (!data || !data.length) throw RequestError(url, 404, data);

    // Otherwise, return the data
    return data;
};

// Validate the data we get from KV for a library
const kvLibraryValidate = (library, data) => {
    // Assets might not exist if there are none, but we should make it an empty array by default
    data.assets = data.assets || [];

    // Non-breaking issues
    if (library !== data.name) {
        console.info('Name mismatch', library, data.name);
        data.name = library;
    }

    // Breaking issues
    if (!data.version) {
        console.error('Version missing', data.name, data);
        if (process.env.SENTRY_DSN) {
            Sentry.withScope(scope => {
                scope.setTag('data', JSON.stringify(data));
                Sentry.captureException(new Error('Version missing in package data'));
            });
        }
        throw new Error('Version missing in package data');
    }

    return data;
};

// Get the metadata for a library on KV
const kvLibrary = async library => {
    const data = await jsonCachedFetch(`${kvBase}/packages/${encodeURIComponent(library)}`);
    return kvLibraryValidate(library, data);
};

// Get the full metadata for a library incl. versions on KV
const kvFullLibrary = async library => {
    const data = await jsonCachedFetch(`${kvBase}/packages/${encodeURIComponent(library)}/all`);
    return kvLibraryValidate(library, data);
};

// Get the SRI data for a library's version
const kvLibraryVersionSri = async (library, version) => {
    return jsonCachedFetch(`${kvBase}/packages/${encodeURIComponent(library)}/sris/${encodeURIComponent(version)}`);
};

// Get all the SRI data for an entire library
const kvLibrarySri = async library => {
    return jsonCachedFetch(`${kvBase}/packages/${encodeURIComponent(library)}/sris`);
};

// Fetch data from a KV endpoint cleanly, handling 404 and error responses for Express
const kvCleanFetch = async (method, parameters, request, response, errorCallback, notFoundMessage) => {
    let data;
    try {
        data = await method(...parameters);
    } catch (err) {
        if (err.status === 404) {
            notFound(request, response, notFoundMessage);
            return;
        }

        // Otherwise, handle as normal error
        errorCallback(err);
        return;
    }

    // Return the actual data
    return data;
};

// Get the metadata for all libraries on KV
// This is an endpoint on the API worker that we don't currently use
// eslint-disable-next-line no-unused-vars
const kvAll = async () => {
    const libraryNames = await kvLibraries();

    const libraries = {};
    const processResponse = (name, data) => {
        try {
            libraries[name] = kvLibraryValidate(name, data);
        } catch (_) {
            // If the validation errors, just don't store it
        }
    };

    // Create all the promise functions
    const libraryPromises = libraryNames.reduce((prev, name) => {
        prev[name] = () => kvFullLibrary(name);
        return prev;
    }, {});

    // Setup the error handler
    const errors = [];
    const errorHandler = (name, e) => {
        errors.push(`${name}: ${e.message}`);
        console.error('Failed to fetch', name, e.message, e.url, e.status, e.body);
        if (process.env.SENTRY_DSN) {
            Sentry.withScope(scope => {
                scope.setTag('library', name);
                const err = new Error('Failed to fetch package');
                err.original = e;
                err.stack = err.stack.split('\n').slice(0, 2).join('\n') + '\n' + e.stack;
                Sentry.captureException(err);
            });
        }
    };

    // Get the data and process it
    const libraryData = await chunkedAsync(libraryPromises, errorHandler);
    Object.entries(libraryData).forEach(([name, data]) => processResponse(name, data));

    return [libraries, errors];
};

module.exports = {
    kvLibraries, kvFullLibrary, kvLibrary, kvLibraryVersion,
    kvLibrarySri, kvLibraryVersionSri,
    kvCleanFetch,
};
