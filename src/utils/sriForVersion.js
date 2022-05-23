/**
 * Create a map of file names to SRI hashes, based on library files and SRI data.
 *
 * @param {string} library Name of the library.
 * @param {string} version Version of the library.
 * @param {string[]} files Names of the files for this version of the library.
 * @param {Object<string, string>} sriData SRI data for the libary version.
 * @param {import('toucan-js')} [sentry] Sentry instance for missing SRI reporting.
 * @return {Object<string, string>}
 */
export default (library, version, files, sriData, sentry = undefined) => {
    // Build the SRI object
    const sri = {};
    for (const file of files) {
        const fullFile = `${library}/${version}/${file}`;

        // If we have an SRI entry for this, add it
        if (sriData && fullFile in sriData) {
            sri[file] = sriData[fullFile];
            continue;
        }

        // If we don't have an SRI entry, but expect one, error!
        if (file.endsWith('.js') || file.endsWith('.css')) {
            console.warn('Missing SRI entry for', fullFile);
            if (sentry) {
                sentry.withScope(scope => {
                    scope.setTag('library', library);
                    scope.setTag('library.version', version);
                    scope.setTag('library.file', file);
                    scope.setTag('library.file.full', fullFile);
                    sentry.captureException(new Error('Missing SRI entry'));
                });
            }
        }
    }

    // Done
    return sri;
};
