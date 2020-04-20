const { spawn, spawnSync } = require('child_process');

const main = () => {
    // Start the API server in the background
    console.info('Starting API server for testing...');
    const server = spawn('npm', ['run', 'dev']);

    // Log server messages
    server.stdout.on('data', data => console.log(`server: ${data}`));
    server.stderr.on('data', data => console.error(`server: error: ${data}`));

    // Give the server time to start (10s)
    setTimeout(() => {
        // Run the tests
        console.info('Starting API tests via mocha...');
        const tests = spawnSync('npm', ['run', 'test:mocha']);

        // Log test results
        const err = tests.stderr.toString().trim();
        console.error(err);
        console.log(tests.stdout.toString().trim());

        // Kill server
        console.info('Killing API server...');
        server.kill();
        try {
            process.kill(server.pid);
        } catch (_) {
            // This is a backup call, if it fails all is fine
        }

        // Exit
        console.info(`Exiting with exit code ${err ? 1 : 0}...`);
        process.exit(err ? 1 : 0);
    }, 10 * 1000);
};

main();
