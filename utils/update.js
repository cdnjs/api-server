// Library imports
const { spawnSync } = require('child_process');
const path = require('path');

module.exports = () => {
    const start = new Date();
    const result = spawnSync(path.join(__dirname, '..', 'updateServer.sh'));
    return {
        started: start.toUTCString(),
        ended: (new Date()).toUTCString(),
        exit: result.status,
        stdout: `${result.stdout}`,
        stderr: `${result.stderr}`,
    };
};
