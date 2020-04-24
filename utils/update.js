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

    result.stdout.on('data', data => {
        data.stdout += `${data}`;
    });

    result.stderr.on('data', data => {
        data.stderr += `${data}`;
    });

    result.on('close', code => {
        data.code = code;
        data.ended = (new Date()).toUTCString();
        app.set('UPDATE', data);

        // Load latest libraries into memory
        libraries.set(app);
    });
};
