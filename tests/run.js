const { spawn, spawnSync } = require('child_process');

const kill = server => {
    console.info('Killing API server...');
    server.kill();
    try {
        process.kill(server.pid);
    } catch (_) {
        // This is a backup call, if it fails all is fine
    }
};

const exit = code => {
    console.info(`Exiting with exit code ${code}...`);
    process.exit(code);
};

const mocha = server => {
    // Run the tests
    console.info('Starting API tests via mocha...');
    const tests = spawnSync('npm', ['run', 'test:mocha']);

    // Kill server
    kill(server);

    // Log test results
    console.info('API tests results:');
    console.log(`${tests.stdout}`.trim());

    // Log errors
    const err = `${tests.stderr}`.trim();
    for (const line of err.split('\n')) {
        console.error(`error: ${line}`);
    }

    // Exit
    exit(err.length ? 1 : 0);
};

const main = () => {
    let exiting = false;

    // Start the API server in the background
    console.info('Starting API server for testing...');
    const server = spawn('npm', ['run', 'dev']);

    // Set a 5 minute timeout for the server starting
    const timeout = setTimeout(() => {
        exiting = true;
        console.error('API server did not start in time, aborting...');
        kill(server);
        exit(1);
    }, 5 * 60 * 1000);

    server.stdout.on('data', data => {
        // Log any stdout messages
        for (const line of `${data}`.trim().split('\n')) {
            console.log(`${(new Date()).toLocaleTimeString()}: server: ${line}`);
        }

        // Run the mocha tests if the server started
        if (!exiting && `${data}`.trim().startsWith('Listening on ')) {
            clearTimeout(timeout);
            mocha(server);
        }
    });

    // Log any stderr messages
    server.stderr.on('data', data => {
        for (const line of `${data}`.trim().split('\n')) {
            console.error(`${(new Date()).toLocaleTimeString()}: server: error: ${line}`);
        }
    });
};

main();
