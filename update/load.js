// Library imports
const path = require('path');
const { readFileSync } = require('fs');

module.exports = (app) => {
    // Load the data into memory
    const rawData = readFileSync(path.join(__dirname, '..', 'data', 'data.json'), 'utf8');
    const jsonData = JSON.parse(rawData);

    // Set library data (merge in to old) & store update log
    app.set('LIBRARIES', {
        ...(app.get('LIBRARIES') || {}),
        ...jsonData.libraries,
    });
    app.set('UPDATE', jsonData.status);
};
