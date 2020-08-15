// Library imports
const Sentry = require('@sentry/node');
const fetch = require('node-fetch');
const gunzip = require('gunzip-maybe');

const kvBase = 'https://metadata.speedcdnjs.com';

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
    const resp = await fetch(url);
    const data = await gunzipBody(resp.body);
    if (resp.status !== 200) throw RequestError(url, resp.status, data);
    let json;
    try {
        json = JSON.parse(data);
    } catch (_) {
        throw RequestError(resp.status, data);
    }
    return json;
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
// This is an endpoint on the API worker that we don't currently use
// eslint-disable-next-line no-unused-vars
const kvLibraryVersion = async (library, version) => {
    return jsonFetch(`${kvBase}/packages/${encodeURIComponent(library)}/versions/${encodeURIComponent(version)}`);
};

// Get the metadata for a library's versions on KV
// This is an endpoint on the API worker that we don't currently use
// eslint-disable-next-line no-unused-vars
const kvLibraryVersions = async library => {
    return jsonFetch(`${kvBase}/packages/${encodeURIComponent(library)}/versions`);
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

// Get the metadata for a library on KV
// This is an endpoint on the API worker that we don't currently use
// eslint-disable-next-line no-unused-vars
const kvLibrary = async library => {
    return jsonFetch(`${kvBase}/packages/${encodeURIComponent(library)}`);
};

// Get the full metadata for a library incl. versions on KV
const kvFullLibrary = async library => {
    return jsonFetch(`${kvBase}/packages/${encodeURIComponent(library)}/all`);
};

// Get a list of libraries from KV
const kvLibraries = async () => {
    return jsonFetch(`${kvBase}/packages`);
};

// Get the metadata for all libraries on KV
const kvAll = async () => {
    const libraryNames = await kvLibraries();

    const libraries = {};
    const processResponse = (name, data) => {
        // Non-breaking issues
        if (name !== data.name) {
            console.info('Name mismatch', name, data.name);
            data.name = name;
        }

        // Breaking issues
        if (!data.version) {
            console.error('Version missing', name, data);
            if (process.env.SENTRY_DSN) {
                Sentry.withScope(scope => {
                    scope.setTag('data', JSON.stringify(data));
                    Sentry.captureException(new Error('Version missing in package data'));
                });
            }
            return;
        }

        // TODO: Check assets

        // Store
        libraries[name] = data;
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

module.exports = { kvAll };
