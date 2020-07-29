// Library imports
const fs = require('fs');
const path = require('path');
const Sentry = require('@sentry/node');

// Get all library data
const all = () => {
    // Load the libraries
    const librariesFile = path.join(__dirname, '..', 'data', 'packages.min.json');
    const libraries = JSON.parse(fs.readFileSync(librariesFile, 'utf8')).packages;

    // Map libraries array into object for easy access
    return libraries.reduce((prev, lib) => {
        if (lib && lib.name && lib.version) {
            // assets might not exist if there are none, but we should make it an empty array by default
            lib.assets = lib.assets || [];
            // Store it by name
            prev[lib.name] = lib;
        } else {
            console.warn('Found bad entry in packages data');
            console.info(lib);
            Sentry.captureException({
                name: 'Bad entry in packages data',
                message: JSON.stringify(lib),
            });
        }
        return prev;
    }, {});
};

// Set library data within the app
const set = app => {
    app.set('LIBRARIES', all());
};

module.exports = { all, set };
