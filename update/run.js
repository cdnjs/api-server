// Library imports
const path = require('path');
const { Worker } = require('worker_threads');

// Local imports
const load = require('./load');

module.exports = (app, localMode) => new Promise((resolve, reject) => {
    console.log('Update worker starting');
    const worker = new Worker(path.join(__dirname, 'worker.js'));
    worker.on('error', reject);
    worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        load(app, localMode);
        console.log('Update worker ended');
        resolve();
    });
});
