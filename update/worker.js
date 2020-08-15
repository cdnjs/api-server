// Library imports
const { spawn } = require('child_process');
const path = require('path');
const { writeFileSync } = require('fs');

// Local imports
const libraries = require('../utils/libraries');

const git = () => new Promise((resolve) => {
    const data = {
        started: (new Date()).toUTCString(),
        ended: null,
        exit: null,
        stdout: '',
        stderr: '',
    };

    const result = spawn(path.join(__dirname, '..', 'bin', 'cloneUpdateData.sh'));
    result.stdout.on('data', d => {
        data.stdout += `${d}`;
    });
    result.stderr.on('data', d => {
        data.stderr += `${d}`;
    });
    result.on('close', code => {
        data.exit = code;
        data.ended = (new Date()).toUTCString();
        resolve(data);
    });
});

const libs = async () => {
    const data = {
        started: null,
        ended: null,
        result: '',
        errors: [],
    };

    const start = Date.now();
    const [libData, errors] = await libraries.kvAll();
    const end = Date.now();

    data.started = (new Date(start)).toUTCString();
    data.ended = (new Date(end)).toUTCString();
    data.errors = errors;
    data.result = `Loaded ${Object.keys(libData).length.toLocaleString()} libraries in ${(end - start).toLocaleString()}ms`;

    return [libData, data];
};

const main = async () => {
    const status = {
        git: {},
        libraries: {},
    };
    let libraries;

    // Run the two update tasks at the same time
    await Promise.all([
        (async () => {
            status.git = await git();
        })(),
        (async () => {
            const [libData, data] = await libs();
            status.libraries = data;
            libraries = libData;
        })(),
    ]);

    // Save the data
    writeFileSync(path.join(__dirname, '..', 'data', 'data.json'), JSON.stringify({
        status,
        libraries,
    }));
};

main().then(() => {});
