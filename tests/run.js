const { spawn, spawnSync } = require('child_process');

const main = () => {
    // Start the API server in the background
    console.info('Starting API server for testing...');
    const server = spawn('npm', ['run', 'dev']);

    // Log server messages
    server.stdout.on('data', data => `${data}`.trim().split('\n').map(line => console.log(`server: ${line}`)));
    server.stderr.on('data', data => `${data}`.trim().split('\n').map(line => console.error(`server: error: ${line}`)));

    // Give the server time to start (10s)
    setTimeout(() => {
        // Run the tests
        console.info('Starting API tests via mocha...');
        const tests = spawnSync('npm', ['run', 'test:mocha']);

        // Kill server
        console.info('Killing API server...');
        server.kill();
        try {
            process.kill(server.pid);
        } catch (_) {
            // This is a backup call, if it fails all is fine
        }

        // Log test results
        console.info('API tests results:');
        console.log(`${tests.stdout}`.trim());
        const err = `${tests.stderr}`.trim();
        console.error(err);

        // Exit
        console.info(`Exiting with exit code ${err ? 1 : 0}...`);
        process.exit(err ? 1 : 0);
    }, 10 * 1000);
};

main();
