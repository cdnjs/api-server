const { spawn, spawnSync } = require('child_process');

const main = () => {
    // Start the API server in the background
    console.info('Starting API server for testing...');
    const server = spawn('npm', ['run', 'dev']);

    // Give the server time to start (5s)
    setTimeout(() => {
        // Run the tests
        console.info('Starting API tests via mocha...');
        const tests = spawnSync('npm', ['run', 'test:mocha:run']);

        // Log test results
        console.error(tests.stderr.toString());
        console.error(tests.stdout.toString());

        // Kill server
        server.kill();
    }, 5000);
};

main();
