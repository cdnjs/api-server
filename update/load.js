// Library imports
const path = require('path');
const { readFileSync } = require('fs');

module.exports = (app, localMode) => {
    // Load the new data in
    const jsonData = JSON.parse(readFileSync(path.join(__dirname, '..', 'data', 'data.json'), 'utf8'));
    app.set('UPDATE', jsonData.status);

    // Clean mem usage next tick
    setImmediate(() => {
        if (!localMode && (typeof global.gc !== 'undefined')) {
            global.gc();
        }
    });
};
