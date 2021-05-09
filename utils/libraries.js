// Library imports
const Sentry = require('@sentry/node');
const fetch = require('node-fetch');
const gunzip = require('gunzip-maybe');

// Local imports
const notFound = require('./not_found');

// Globals
const kvBase = process.env.METADATA_BASE || 'https://metadata.speedcdnjs.com';
const cache = {};

// Clean cache hits that are ready to be purged
const cleanCache = () => {
    Object.entries(cache).forEach(([key, value]) => {
        if (Date.now() < value.purge) return;
        if (value.fetching) return;

        delete cache[key];
    });
};

// Clean cache every 1 minute
setInterval(cleanCache, 60 * 1000);

// A custom error for a non-200 request response
const RequestError = (url, status, body) => {
    const err = new Error('Request failed');
    err.url = url;
    err.status = status;
    err.body = body;
    return err;
};

// We're always fetching JSON, but sometimes it's gzipped
const gunzipBody = (body) => new Promise((resolve, reject) => {
    const gunzipHandler = gunzip();
    body.pipe(gunzipHandler);
    let string = '';
    gunzipHandler.on('data', (data) => {
        string += data.toString();
    }).on('end', () => {
        resolve(string);
    }).on('error', (err) => {
        reject(err);
    });
});

// Fetch a JSON endpoint, throw for a non-200 response
const jsonFetch = async url => {
    // Fetch the URL and gunzip the data
    const resp = await fetch(url);
    const data = await gunzipBody(resp.body);

    // If not 200, throw an error
    if (resp.status !== 200) throw RequestError(url, resp.status, data);

    // Parse data into object
    let json;
    try {
        json = JSON.parse(data);
    } catch (_) {
        throw RequestError(resp.status, data);
    }

    // Store in cache
    if (process.env.DISABLE_CACHING !== '1') {
        cache[url] = {
            expires: Date.now() + 5 * 60 * 1000,
            purge: Date.now() + 10 * 60 * 1000,
            data: json,
            fetching: false,
        };
    }
    return json;
};

// Fetch a JSON endpoint with caching, throw for a non-200 response
const jsonCachedFetch = async url => {
    const cacheHit = cache[url];

    // If no cache data, fetch data
    if (!cacheHit) {
        return jsonFetch(url);
    }

    // If old data, re-fetch in background
    if (Date.now() > cacheHit.expires && !cacheHit.fetching) {
        cacheHit.fetching = true;
        jsonFetch(url).then(() => {}).catch(() => {});
    }

    return cacheHit.data;
};

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
    return jsonCachedFetch(`${kvBase}/packages/${encodeURIComponent(library)}/versions/${encodeURIComponent(version)}`);
};

// Get the metadata for a library's versions on KV
// This is an endpoint on the API worker that we don't currently use
// eslint-disable-next-line no-unused-vars
const kvLibraryVersions = async library => {
    return jsonCachedFetch(`${kvBase}/packages/${encodeURIComponent(library)}/versions`);
};

// Get the metadata for a library's assets on KV
// This is an endpoint on the API worker that we don't currently use
// eslint-disable-next-line no-unused-vars
const kvLibraryAssets = async (library, versions = undefined) => {
    versions = versions || await kvLibraryVersions(library);

    // Create all the promise functions
    const versionPromises = versions.reduce((prev, version) => {
        prev[version] = () => kvLibraryVersion(library, version);
        return prev;
    }, {});

    // Get the data and process it
    const versionData = await chunkedAsync(versionPromises, (_, err) => { throw err; });
    return Object.entries(versionData).map(([version, files]) => ({ version, files }));
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

// Get a list of libraries from KV
const kvLibraries = async () => {
    return jsonCachedFetch(`${kvBase}/packages`);
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
