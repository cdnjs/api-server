// Library imports
const { spawn } = require('child_process');
const path = require('path');

// Local imports
const libraries = require('./libraries');

module.exports = app => new Promise(resolve => {
    const data = {
        git: {
            started: (new Date()).toUTCString(),
            ended: null,
            exit: null,
            stdout: '',
            stderr: '',
        },
        libraries: {
            started: null,
            ended: null,
            result: '',
            errors: [],
        },
    };

    // Do the git updates for SRIs & tutorials
    const result = spawn(path.join(__dirname, '..', 'bin', 'updateData.sh'));
    result.stdout.on('data', d => {
        data.git.stdout += `${d}`;
    });
    result.stderr.on('data', d => {
        data.git.stderr += `${d}`;
    });
    result.on('close', async code => {
        data.git.exit = code;
        data.git.ended = (new Date()).toUTCString();

        // Now, do the libraries update
        const start = Date.now();
        const [libData, errors] = await libraries.kvAll();
        const end = Date.now();

        data.libraries.started = (new Date(start)).toUTCString();
        data.libraries.ended = (new Date(end)).toUTCString();
        data.libraries.errors = errors;
        data.libraries.result = `Loaded ${Object.keys(libData).length.toLocaleString()} libraries in ${(end - start).toLocaleString()}ms`;

        // Set library data (merge in to old) & store update log
        app.set('LIBRARIES', {
            ...(app.get('LIBRARIES') || {}),
            ...libData,
        });
        app.set('UPDATE', data);
        resolve();
    });
});
