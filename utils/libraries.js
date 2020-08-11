// Library imports
const Sentry = require('@sentry/node');
const fetch = require('node-fetch');

const kvBase = 'https://metadata.speedcdnjs.com';

// A custom error for a non-200 request response
const RequestError = (status, body) => {
    const err = new Error('Request failed');
    err.status = status;
    err.body = body;
    return err;
};

// Fetch a JSON endpoint, throw for a non-200 response
const jsonFetch = async url => {
    const resp = await fetch(url);
    if (resp.status !== 200) throw RequestError(resp.status, await resp.text());
    return resp.json();
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

// Get a list of libraries from KV
const kvLibraries = async () => {
    return jsonFetch(`${kvBase}/packages`);
};

// Get the metadata for a library's version on KV
const kvLibraryVersion = async (library, version) => {
    return jsonFetch(`${kvBase}/packages/${library}/versions/${version}`);
};

// Get the metadata for a library's versions on KV
const kvLibraryVersions = async library => {
    return jsonFetch(`${kvBase}/packages/${library}/versions`);
};

// Get the metadata for a library's assets on KV
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
const kvLibrary = async library => {
    return jsonFetch(`${kvBase}/packages/${library}`);
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
    const libraryPromises = libraryNames.reduce((prev, name) => {
        prev[name] = () => kvLibrary(name);
        return prev;
    }, {});

    // Setup the error handler
    const errors = [];
    const errorHandler = (name, err) => {
        errors.push(`${name}: ${err.message}`);
        console.error('Failed to fetch', name, err.message);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException({
                name: 'Failed to fetch package',
                message: JSON.stringify([name, err.message, err]),
            });
        }
    };

    // Get the data and process it
    const libraryData = await chunkedAsync(libraryPromises, errorHandler);
    Object.entries(libraryData).forEach(([name, data]) => processResponse(name, data));

    // console.log('Time taken (ms):', Date.now() - start);
    // console.log('Libraries fetched:', Object.keys(libraries).length);
    // console.log('Time per chunk (ms):', (Date.now() - start) / (Object.keys(libraries).length / 30));

    return [libraries, errors];
};

module.exports = { kvAll, kvLibraryVersion, kvLibraryVersions, kvLibraryAssets };
