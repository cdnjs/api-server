// Library imports
const fs = require('fs');
const path = require('path');

module.exports = (library, tutorial) => {
    // Fetch modified/created data
    const modified = fs.readFileSync(path.join(__dirname, '..', 'data', 'tutorialsModified.txt'), 'utf8');
    const created = fs.readFileSync(path.join(__dirname, '..', 'data', 'tutorialsCreated.txt'), 'utf8');

    // Get the tutorial data
    const base = path.join(__dirname, '..', 'data', 'tutorials', library, tutorial);
    const data = JSON.parse(fs.readFileSync(path.join(base, 'tutorial.json'), 'utf8'));
    const content = fs.readFileSync(path.join(base, 'index.md'), 'utf8');

    // Get the timestamps
    const timestampReg = new RegExp(`(?:^|\n)${path.join(library, tutorial, 'tutorial.json')}: (.+)(?:$|\n)`);
    const modifiedMatch = modified.match(timestampReg);
    const createdMatch = created.match(timestampReg);

    // Generate the data
    return {
        id: tutorial,
        modified: modifiedMatch && modifiedMatch.length ? new Date(modifiedMatch[1]) : new Date(),
        created: createdMatch && createdMatch.length ? new Date(createdMatch[1]) : new Date(),
        ...data,
        content,
    };
};
