// Library imports
const path = require('path');
const { Worker } = require('worker_threads');

module.exports = (app) => new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'));

    // Handle the response data
    worker.on('message', data => {
        // Set library data (merge in to old) & store update log
        app.set('LIBRARIES', {
            ...(app.get('LIBRARIES') || {}),
            ...data.libraries,
        });
        app.set('UPDATE', data.status);

        // Done
        resolve();
    });

    // Handle an error
    worker.on('error', reject);

    // Handle bad exit
    worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
});
