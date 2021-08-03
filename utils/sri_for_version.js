// Library imports
const Sentry = require('@sentry/node');

module.exports = (library, version, files, sriData) => {
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
            if (process.env.SENTRY_DSN) {
                Sentry.withScope(scope => {
                    scope.setTag('library', library);
                    scope.setTag('library.version', version);
                    scope.setTag('library.file', file);
                    scope.setTag('library.file.full', fullFile);
                    Sentry.captureException(new Error('Missing SRI entry'));
                });
            }
        }
    }

    // Done
    return sri;
};
