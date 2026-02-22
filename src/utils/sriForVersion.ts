// import * as Sentry from '@sentry/cloudflare';

/**
 * Create a map of file names to SRI hashes, based on library files and SRI data.
 *
 * @param library Name of the library.
 * @param version Version of the library.
 * @param files Names of the files for this version of the library.
 * @param sriData SRI data for the library version.
 */
export default (library: string, version: string, files: string[], sriData: Record<string, string>) => {
    // Build the SRI object
    const sri: Record<string, string> = {};
    for (const file of files) {
        const fullFile = `${library}/${version}/${file}`;

        // If we have an SRI entry for this, add it
        if (sriData && fullFile in sriData) {
            sri[file] = sriData[fullFile];
            continue;
        }

        // If we don't have an SRI entry, but expect one, error!
        if (file.endsWith('.js') || file.endsWith('.css')) {
            // Sentry.withScope(scope => {
            //     scope.setTag('library', library);
            //     scope.setTag('library.version', version);
            //     scope.setTag('library.file', file);
            //     scope.setTag('library.file.full', fullFile);
            //     Sentry.captureException(new Error('Missing SRI entry'));
            // });
        }
    }

    // Done
    return sri;
};
