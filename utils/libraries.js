// Library imports
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

    // Create all the promise functions
    const libraries = {};
    const failed = [];
    const libraryPromises = libraryNames.map(name => (async () => {
        const data = await kvLibrary(name).catch(() => failed.push(name));
        if (data) libraries[name] = data;
    }));

    // Chunk up the functions to parallelise
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
        const data = await kvLibrary(name).catch(e => {
            errors.push(`${name}: ${e.message}`);
        });
        if (data) libraries[name] = data;
    }

    // TODO: Any validation needed to the data

    // console.log('Time taken (ms):', Date.now() - start);
    // console.log('Libraries fetched:', Object.keys(libraries).length);
    // console.log('Time per chunk (ms):', (Date.now() - start) / (Object.keys(libraries).length / 30));

    return [libraries, errors];
};

module.exports = { kvAll };
