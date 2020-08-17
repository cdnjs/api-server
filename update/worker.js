// Library imports
const { spawn } = require('child_process');
const path = require('path');
const { writeFileSync } = require('fs');

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

const main = async () => {
    const status = {
        git: {},
    };

    // Run the update task
    // More could be added in parallel here wih Promise.all
    status.git = await git();

    // Save the data
    writeFileSync(path.join(__dirname, '..', 'data', 'data.json'), JSON.stringify({
        status,
    }));
};

main().then(() => {});
