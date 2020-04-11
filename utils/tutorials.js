// Library imports
const fs = require('fs');
const path = require('path');

module.exports = library => {
    // Base tutorials path
    const base  = path.join(__dirname, '..', 'data', 'tutorials', library);

    // Fetch the tutorials
    let results = [];
    try {
        results = fs.readdirSync(base);
    } catch (_) {
        // If no tutorials, this will error and results will be an empty array
    }

    // Get the data & contents of each one, and as a dictionary.
    return results.map(file => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(base, file, 'tutorial.json'), 'utf8'));
            const content = fs.readFileSync(path.join(base, file, 'index.md'), 'utf8');
            return {
                id: file,
                ...data,
                content,
            };
        } catch (_) {
            // If index.md or tutorial.json don't exist (or not valid), just skip this result
        }
    }).filter(x => x !== undefined);
};
