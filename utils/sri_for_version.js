// Library imports
const fs = require('fs');
const path = require('path');
const Sentry = require('@sentry/node');

module.exports = (library, version, files) => {
    // Load in the data for the version, if it doesn't exist, error
    let data;
    try {
        data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sri', library, `${version}.json`), 'utf8'));
    } catch (e) {
        const fullLibrary = `${library}/${version}`;
        console.warn('Failed to load SRI data for', fullLibrary);
        console.info(e, e.message, e.stack);
        Sentry.captureException({
            name: 'Failed to load SRI data',
            message: `${fullLibrary}: ${e.message}`,
        });
        throw e;
    }

    // Build the SRI object
    const sri = {};
    for (const file of files) {
        // If we have an SRI entry for this, add it
        if (file in data) {
            sri[file] = data[file];
            continue;
        }

        // If we don't have an SRI entry, but expect one, error!
        if (file.endsWith('.js') || file.endsWith('.css')) {
            const fullFile = `${library}/${version}/${file}`;
            console.warn('Missing SRI entry for', fullFile);
            Sentry.captureException({
                name: 'Missing SRI entry',
                message: fullFile,
            });
        }
    }

    // Done
    return sri;
};
