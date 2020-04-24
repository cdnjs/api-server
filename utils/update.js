// Library imports
const { spawn } = require('child_process');
const path = require('path');

// Local imports
const libraries = require('./libraries');

module.exports = app => {
    const data = {
        started: (new Date()).toUTCString(),
        ended: null,
        exit: null,
        stdout: '',
        stderr: '',
    };

    const result = spawn(path.join(__dirname, '..', 'updateServer.sh'));

    result.stdout.on('data', d => {
        data.stdout += `${d}`;
    });

    result.stderr.on('data', d => {
        data.stderr += `${d}`;
    });

    result.on('close', code => {
        data.code = code;
        data.ended = (new Date()).toUTCString();
        app.set('UPDATE', data);

        // Load latest libraries into memory
        libraries.set(app);
    });
};
