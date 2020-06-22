// Library imports
const fs = require('fs');
const path = require('path');

// Get all library data
const all = () => {
    // Load the libraries
    const librariesFile = path.join(__dirname, '..', 'data', 'packages.min.json');
    const libraries = JSON.parse(fs.readFileSync(librariesFile, 'utf8')).packages;

    // Map libraries array into object for easy access
    return libraries.reduce((prev, lib) => {
        if (lib !== null) {
            prev[lib.name] = lib;
        } else {
            console.warn('found null entry in packages data');
        }
        return prev;
    }, {});
};

// Set library data within the app
const set = app => {
    app.set('LIBRARIES', all());
};

module.exports = { all, set };
